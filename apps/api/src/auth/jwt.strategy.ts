import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { AuthenticatedUser } from "@transcriptioneer/types";
import type { Env } from "../config/env.validation";

function extractFromCookie(req: Request): string | null {
  const cookies = req.cookies as Record<string, string | undefined> | undefined;
  return cookies?.access_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<Env, true>) {
    super({
      // Cookie first (the browser client), Bearer header as a fallback
      // (service-to-service or tooling that can't rely on cookies).
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_ACCESS_SECRET", { infer: true }),
    });
  }

  validate(payload: AuthenticatedUser): AuthenticatedUser {
    // Whatever is returned here becomes `req.user` — payload is already the
    // shape defined in packages/types, so no reshaping needed.
    return payload;
  }
}
