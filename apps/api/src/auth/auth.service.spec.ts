/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call,
   @typescript-eslint/no-unsafe-member-access --
   this file wires an untyped Jest mock of the Prisma client; the real client is fully typed. */
import { ConflictException, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

// A tiny in-memory stand-in for the Prisma client's auth-relevant models.
// AuthService imports the real `prisma` singleton directly (see
// packages/database/src/index.ts), so it's mocked at the module level here
// rather than injected — there's no live Postgres in this test environment.
// The factory below must be fully self-contained (no references to outer
// `const`/`let` bindings) since jest hoists jest.mock() above them.
jest.mock("@transcriptioneer/database", () => {
  const prisma: any = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    organization: { create: jest.fn(), findFirst: jest.fn() },
    organizationMember: { create: jest.fn() },
    oAuthAccount: { findUnique: jest.fn(), create: jest.fn() },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback(prisma)),
  };
  return { prisma };
});

import { prisma } from "@transcriptioneer/database";
import { AuthService } from "./auth.service";

type FakeUser = {
  id: string;
  email: string;
  passwordHash: string | null;
  name: string;
  createdAt: Date;
};
type FakeOrg = { id: string; name: string; createdAt: Date };
type FakeMembership = {
  userId: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
};
type FakeRefreshToken = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
};
type FakeOAuthAccount = {
  id: string;
  provider: "GOOGLE" | "APPLE" | "MICROSOFT";
  providerAccountId: string;
  userId: string;
};

let users: FakeUser[];
let orgs: FakeOrg[];
let memberships: FakeMembership[];
let refreshTokens: FakeRefreshToken[];
let oauthAccounts: FakeOAuthAccount[];
let idCounter: number;

function nextId(): string {
  idCounter += 1;
  return `id-${idCounter}`;
}

function membershipWithOrg(m: FakeMembership) {
  const org = orgs.find((o) => o.id === m.organizationId);
  if (!org) throw new Error("org not found in fake store");
  return { organizationId: m.organizationId, role: m.role, organization: org };
}

function wireMockPrisma(): void {
  const p = prisma as any;

  p.user.findUnique.mockImplementation(({ where, include }: any) => {
    const user = users.find((u) => u.id === where.id || u.email === where.email);
    if (!user) return Promise.resolve(null);
    if (include?.memberships) {
      const userMemberships = memberships
        .filter((m) => m.userId === user.id)
        .map(membershipWithOrg);
      return Promise.resolve({ ...user, memberships: userMemberships });
    }
    return Promise.resolve(user);
  });
  p.user.create.mockImplementation(({ data }: any) => {
    const user: FakeUser = { id: nextId(), createdAt: new Date(), ...data };
    users.push(user);
    return Promise.resolve(user);
  });

  p.organization.create.mockImplementation(({ data }: any) => {
    const org: FakeOrg = { id: nextId(), createdAt: new Date(), ...data };
    orgs.push(org);
    return Promise.resolve(org);
  });
  p.organization.findFirst.mockImplementation(({ where }: any) => {
    const org = orgs.find(
      (o) =>
        o.id === where.id &&
        memberships.some(
          (m) => m.organizationId === o.id && m.userId === where.members.some.userId,
        ),
    );
    return Promise.resolve(org ?? null);
  });

  p.organizationMember.create.mockImplementation(({ data }: any) => {
    const membership: FakeMembership = { ...data };
    memberships.push(membership);
    return Promise.resolve(membershipWithOrg(membership));
  });

  p.oAuthAccount.findUnique.mockImplementation(({ where }: any) => {
    const key = where.provider_providerAccountId;
    const account = oauthAccounts.find(
      (a) => a.provider === key.provider && a.providerAccountId === key.providerAccountId,
    );
    return Promise.resolve(account ?? null);
  });
  p.oAuthAccount.create.mockImplementation(({ data }: any) => {
    const account: FakeOAuthAccount = { id: nextId(), ...data };
    oauthAccounts.push(account);
    return Promise.resolve(account);
  });

  p.refreshToken.create.mockImplementation(({ data }: any) => {
    const token: FakeRefreshToken = {
      id: nextId(),
      revokedAt: null,
      replacedByTokenId: null,
      ...data,
    };
    refreshTokens.push(token);
    return Promise.resolve(token);
  });
  p.refreshToken.findUnique.mockImplementation(({ where }: any) => {
    return Promise.resolve(refreshTokens.find((t) => t.tokenHash === where.tokenHash) ?? null);
  });
  p.refreshToken.update.mockImplementation(({ where, data }: any) => {
    const token = refreshTokens.find((t) => t.id === where.id);
    if (!token) throw new Error("refresh token not found");
    Object.assign(token, data);
    return Promise.resolve(token);
  });
  p.refreshToken.updateMany.mockImplementation(({ where, data }: any) => {
    let count = 0;
    for (const token of refreshTokens) {
      const matchesHash = where.tokenHash === undefined || token.tokenHash === where.tokenHash;
      const matchesUser = where.userId === undefined || token.userId === where.userId;
      const matchesRevoked = where.revokedAt === undefined || token.revokedAt === where.revokedAt;
      if (matchesHash && matchesUser && matchesRevoked) {
        Object.assign(token, data);
        count += 1;
      }
    }
    return Promise.resolve({ count });
  });
}

const TEST_ENV: Record<string, unknown> = {
  JWT_ACCESS_SECRET: "test-access-secret-at-least-32-characters-long",
  JWT_REFRESH_SECRET: "test-refresh-secret-at-least-32-characters-long",
  JWT_ACCESS_TTL_SECONDS: 900,
  JWT_REFRESH_TTL_DAYS: 30,
};

function makeConfigService(): ConfigService<Record<string, unknown>, true> {
  return { get: (key: string) => TEST_ENV[key] } as unknown as ConfigService<
    Record<string, unknown>,
    true
  >;
}

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    users = [];
    orgs = [];
    memberships = [];
    refreshTokens = [];
    oauthAccounts = [];
    idCounter = 0;
    jest.clearAllMocks();
    wireMockPrisma();
    service = new AuthService(new JwtService(), makeConfigService());
  });

  describe("register", () => {
    it("creates a user, organization, and OWNER membership, and issues tokens", async () => {
      const result = await service.register({
        email: "founder@example.com",
        password: "correcthorse1",
        name: "Founder",
        organizationName: "Acme Inc",
      });

      expect(result.session.user.email).toBe("founder@example.com");
      expect(result.session.organization.name).toBe("Acme Inc");
      expect(result.session.role).toBe("OWNER");
      expect(result.tokens.accessToken).toEqual(expect.any(String));
      expect(result.tokens.refreshToken).toEqual(expect.any(String));

      const storedUser = users[0];
      expect(storedUser.passwordHash).not.toBe("correcthorse1");
      expect(storedUser.passwordHash).toMatch(/^\$argon2id\$/);
    });

    it("rejects a duplicate email without leaking which field failed elsewhere", async () => {
      await service.register({
        email: "dup@example.com",
        password: "correcthorse1",
        name: "First",
        organizationName: "Org A",
      });

      await expect(
        service.register({
          email: "dup@example.com",
          password: "anotherpassword1",
          name: "Second",
          organizationName: "Org B",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await service.register({
        email: "user@example.com",
        password: "correcthorse1",
        name: "User",
        organizationName: "Org",
      });
    });

    it("succeeds with correct credentials", async () => {
      const result = await service.login({ email: "user@example.com", password: "correcthorse1" });
      expect(result.session.user.email).toBe("user@example.com");
    });

    it("rejects a wrong password with the same message as a nonexistent email", async () => {
      let wrongPasswordError: unknown;
      let noSuchUserError: unknown;
      try {
        await service.login({ email: "user@example.com", password: "wrongpassword1" });
      } catch (error) {
        wrongPasswordError = error;
      }
      try {
        await service.login({ email: "nobody@example.com", password: "whatever1" });
      } catch (error) {
        noSuchUserError = error;
      }

      expect(wrongPasswordError).toBeInstanceOf(UnauthorizedException);
      expect(noSuchUserError).toBeInstanceOf(UnauthorizedException);
      expect((wrongPasswordError as UnauthorizedException).message).toBe(
        (noSuchUserError as UnauthorizedException).message,
      );
    });
  });

  describe("refresh", () => {
    it("rotates the refresh token and issues a new access token", async () => {
      const { tokens } = await service.register({
        email: "rotate@example.com",
        password: "correcthorse1",
        name: "User",
        organizationName: "Org",
      });

      const rotated = await service.refresh(tokens.refreshToken);

      expect(rotated.tokens.refreshToken).not.toBe(tokens.refreshToken);
      expect(rotated.tokens.accessToken).toEqual(expect.any(String));
    });

    it("rejects and revokes the whole chain when a rotated token is reused", async () => {
      const { tokens } = await service.register({
        email: "theft@example.com",
        password: "correcthorse1",
        name: "User",
        organizationName: "Org",
      });

      const rotated = await service.refresh(tokens.refreshToken);

      // Reusing the original (now-rotated) token is the theft signal.
      await expect(service.refresh(tokens.refreshToken)).rejects.toThrow(UnauthorizedException);

      // The whole chain — including the token issued by the legitimate
      // rotation — must now be revoked too.
      await expect(service.refresh(rotated.tokens.refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("rejects an unknown refresh token", async () => {
      await expect(service.refresh("not-a-real-token")).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("invalidates the refresh token so it can no longer be used", async () => {
      const { tokens } = await service.register({
        email: "logout@example.com",
        password: "correcthorse1",
        name: "User",
        organizationName: "Org",
      });

      await service.logout(tokens.refreshToken);

      await expect(service.refresh(tokens.refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("getOrganizationForUser (cross-org scoping)", () => {
    it("returns the organization when the caller is a member", async () => {
      const { session } = await service.register({
        email: "member@example.com",
        password: "correcthorse1",
        name: "Member",
        organizationName: "My Org",
      });

      const authenticatedUser = {
        sub: users.find((u) => u.email === "member@example.com")!.id,
        email: "member@example.com",
        organizationId: session.organization.id,
        role: "OWNER" as const,
      };

      const org = await service.getOrganizationForUser(authenticatedUser, session.organization.id);
      expect(org.id).toBe(session.organization.id);
    });

    it("rejects access to an organization the caller does not belong to", async () => {
      const orgA = await service.register({
        email: "a@example.com",
        password: "correcthorse1",
        name: "A",
        organizationName: "Org A",
      });
      const orgB = await service.register({
        email: "b@example.com",
        password: "correcthorse1",
        name: "B",
        organizationName: "Org B",
      });

      const userAAuthenticated = {
        sub: users.find((u) => u.email === "a@example.com")!.id,
        email: "a@example.com",
        organizationId: orgA.session.organization.id,
        role: "OWNER" as const,
      };

      await expect(
        service.getOrganizationForUser(userAAuthenticated, orgB.session.organization.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("loginOrRegisterWithOAuth", () => {
    it("creates a new user, workspace, and OAuth account on first sign-in", async () => {
      const result = await service.loginOrRegisterWithOAuth({
        provider: "GOOGLE",
        providerAccountId: "google-123",
        email: "newvia.google@example.com",
        name: "Google User",
      });

      expect(result.session.user.email).toBe("newvia.google@example.com");
      expect(result.session.organization.name).toBe("Google User's Workspace");
      expect(result.session.role).toBe("OWNER");
      expect(users[0].passwordHash).toBeNull();
      expect(oauthAccounts).toHaveLength(1);
      expect(oauthAccounts[0]).toMatchObject({
        provider: "GOOGLE",
        providerAccountId: "google-123",
      });
    });

    it("returns the same account on a second sign-in with the same provider id", async () => {
      const first = await service.loginOrRegisterWithOAuth({
        provider: "GOOGLE",
        providerAccountId: "google-456",
        email: "repeat@example.com",
        name: "Repeat User",
      });

      const second = await service.loginOrRegisterWithOAuth({
        provider: "GOOGLE",
        providerAccountId: "google-456",
        email: "repeat@example.com",
        name: "Repeat User",
      });

      expect(second.session.user.id).toBe(first.session.user.id);
      expect(oauthAccounts).toHaveLength(1);
    });

    it("links to an existing password account when the email already matches", async () => {
      const passwordAccount = await service.register({
        email: "linkme@example.com",
        password: "correcthorse1",
        name: "Link Me",
        organizationName: "Existing Org",
      });

      const linked = await service.loginOrRegisterWithOAuth({
        provider: "GOOGLE",
        providerAccountId: "google-789",
        email: "linkme@example.com",
        name: "Link Me",
      });

      expect(linked.session.user.id).toBe(passwordAccount.session.user.id);
      expect(linked.session.organization.id).toBe(passwordAccount.session.organization.id);
      // No second user/org was created — the OAuth account attached to the
      // existing one instead.
      expect(users).toHaveLength(1);
      expect(oauthAccounts).toHaveLength(1);
    });
  });
});
