import { createHash, randomBytes } from "node:crypto";
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { prisma } from "@transcriptioneer/database";
import type { OAuthProvider } from "@transcriptioneer/database";
import type {
  AuthenticatedUser,
  AuthSession,
  Organization,
  OrgRole,
  User,
} from "@transcriptioneer/types";
import type { LoginInput, RegisterInput } from "@transcriptioneer/validation";
import type { Env } from "../config/env.validation";

export type IssuedTokens = {
  accessToken: string;
  refreshToken: string;
  accessTtlSeconds: number;
  refreshTtlDays: number;
};

export type AuthResult = {
  session: AuthSession;
  tokens: IssuedTokens;
};

type MembershipWithOrg = {
  organizationId: string;
  role: OrgRole;
  organization: { id: string; name: string; createdAt: Date };
};

function hashRefreshToken(rawToken: string): string {
  // Not Argon2: this is a high-entropy random token, not a low-entropy
  // password, so a fast hash is fine and lets lookups stay indexable.
  return createHash("sha256").update(rawToken).digest("hex");
}

function toPublicUser(user: { id: string; email: string; name: string; createdAt: Date }): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

function toPublicOrg(org: { id: string; name: string; createdAt: Date }): Organization {
  return { id: org.id, name: org.name, createdAt: org.createdAt.toISOString() };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists.");
    }

    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });

    const { user, membership } = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: { email: input.email, passwordHash, name: input.name },
      });
      const organization = await tx.organization.create({
        data: { name: input.organizationName },
      });
      const createdMembership = await tx.organizationMember.create({
        data: { userId: createdUser.id, organizationId: organization.id, role: "OWNER" },
        include: { organization: true },
      });
      return { user: createdUser, membership: createdMembership };
    });

    return this.buildAuthResult(user, membership);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { memberships: { include: { organization: true }, take: 1 } },
    });

    // Same generic message whether the email doesn't exist, the account is
    // OAuth-only (no passwordHash), or the password is wrong — never reveal
    // which one it was.
    const invalidCredentials = new UnauthorizedException("Invalid email or password.");

    if (!user || !user.passwordHash) {
      throw invalidCredentials;
    }
    const passwordValid = await argon2.verify(user.passwordHash, input.password);
    if (!passwordValid) {
      throw invalidCredentials;
    }

    const membership = user.memberships[0];
    if (!membership) {
      throw invalidCredentials;
    }

    return this.buildAuthResult(user, membership);
  }

  /** Shared by every OAuth provider's callback handler (Google today; Apple/
   * Microsoft once their strategies are wired). Links to an existing
   * password account by email when one exists (the provider has already
   * verified the email), otherwise creates a new User + Organization, same
   * shape as `register` but with no password ever set. */
  async loginOrRegisterWithOAuth(params: {
    provider: OAuthProvider;
    providerAccountId: string;
    email: string;
    name: string;
  }): Promise<AuthResult> {
    const existingAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: params.provider,
          providerAccountId: params.providerAccountId,
        },
      },
    });

    if (existingAccount) {
      const user = await prisma.user.findUnique({
        where: { id: existingAccount.userId },
        include: { memberships: { include: { organization: true }, take: 1 } },
      });
      const membership = user?.memberships[0];
      if (!user || !membership) {
        throw new UnauthorizedException("Invalid OAuth account.");
      }
      return this.buildAuthResult(user, membership);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: params.email },
      include: { memberships: { include: { organization: true }, take: 1 } },
    });

    if (existingUser) {
      const membership = existingUser.memberships[0];
      if (!membership) {
        throw new UnauthorizedException("Account exists but has no organization.");
      }
      await prisma.oAuthAccount.create({
        data: {
          provider: params.provider,
          providerAccountId: params.providerAccountId,
          userId: existingUser.id,
        },
      });
      return this.buildAuthResult(existingUser, membership);
    }

    const { user, membership } = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: { email: params.email, passwordHash: null, name: params.name },
      });
      const organization = await tx.organization.create({
        data: { name: `${params.name}'s Workspace` },
      });
      const createdMembership = await tx.organizationMember.create({
        data: { userId: createdUser.id, organizationId: organization.id, role: "OWNER" },
        include: { organization: true },
      });
      await tx.oAuthAccount.create({
        data: {
          provider: params.provider,
          providerAccountId: params.providerAccountId,
          userId: createdUser.id,
        },
      });
      return { user: createdUser, membership: createdMembership };
    });

    return this.buildAuthResult(user, membership);
  }

  async refresh(rawRefreshToken: string): Promise<AuthResult> {
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!existing) {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    if (existing.revokedAt) {
      // A previously-rotated (or logged-out) token being presented again is
      // a reuse/theft signal — revoke every live token for this user so a
      // stolen refresh token can't keep minting new sessions.
      await this.revokeAllForUser(existing.userId);
      throw new UnauthorizedException("Session revoked — please log in again.");
    }

    if (existing.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException("Refresh token expired.");
    }

    const user = await prisma.user.findUnique({
      where: { id: existing.userId },
      include: { memberships: { include: { organization: true }, take: 1 } },
    });
    const membership = user?.memberships[0];
    if (!user || !membership) {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    const refreshTtlDays = this.configService.get("JWT_REFRESH_TTL_DAYS", { infer: true });
    const newRawToken = randomBytes(32).toString("hex");
    const newTokenHash = hashRefreshToken(newRawToken);
    const newExpiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({
        data: { userId: user.id, tokenHash: newTokenHash, expiresAt: newExpiresAt },
      });
      await tx.refreshToken.update({
        where: { id: existing.id },
        data: { revokedAt: new Date(), replacedByTokenId: created.id },
      });
    });

    return this.buildAuthResult(user, membership, newRawToken);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(rawRefreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Repository-layer org scoping: the query itself only matches an
   * organization the caller belongs to — a mismatched id yields nothing to
   * distinguish from "not found," rather than a query that fetches the org
   * first and checks membership after the fact. */
  async getOrganizationForUser(user: AuthenticatedUser, organizationId: string) {
    const organization = await prisma.organization.findFirst({
      where: { id: organizationId, members: { some: { userId: user.sub } } },
    });
    if (!organization) {
      throw new ForbiddenException("You do not have access to this organization.");
    }
    return toPublicOrg(organization);
  }

  async getSessionForUser(userId: string): Promise<AuthSession> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { memberships: { include: { organization: true }, take: 1 } },
    });
    const membership = user?.memberships[0];
    if (!user || !membership) {
      throw new UnauthorizedException("User no longer exists.");
    }
    return this.toSession(user, membership);
  }

  private async buildAuthResult(
    user: {
      id: string;
      email: string;
      name: string;
      createdAt: Date;
      passwordHash?: string | null;
    },
    membership: MembershipWithOrg,
    existingRawRefreshToken?: string,
  ): Promise<AuthResult> {
    const accessTtlSeconds = this.configService.get("JWT_ACCESS_TTL_SECONDS", { infer: true });
    const refreshTtlDays = this.configService.get("JWT_REFRESH_TTL_DAYS", { infer: true });

    const payload: AuthenticatedUser = {
      sub: user.id,
      email: user.email,
      organizationId: membership.organizationId,
      role: membership.role,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_ACCESS_SECRET", { infer: true }),
      expiresIn: accessTtlSeconds,
    });

    let refreshToken = existingRawRefreshToken ?? null;
    if (!refreshToken) {
      refreshToken = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);
      await prisma.refreshToken.create({
        data: { userId: user.id, tokenHash: hashRefreshToken(refreshToken), expiresAt },
      });
    }

    return {
      session: this.toSession(user, membership),
      tokens: { accessToken, refreshToken, accessTtlSeconds, refreshTtlDays },
    };
  }

  private toSession(
    user: { id: string; email: string; name: string; createdAt: Date },
    membership: MembershipWithOrg,
  ): AuthSession {
    return {
      user: toPublicUser(user),
      organization: toPublicOrg(membership.organization),
      role: membership.role,
    };
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
