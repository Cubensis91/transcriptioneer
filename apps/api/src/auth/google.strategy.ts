import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, type Profile, type VerifyCallback } from "passport-google-oauth20";
import type { Env } from "../config/env.validation";

export type GoogleOAuthPayload = {
  providerAccountId: string;
  email: string;
  name: string;
};

/** Always registered as a provider (see auth.module.ts) — Passport needs the
 * "google" strategy to exist at all, or every /google request fails with
 * "Unknown authentication strategy" regardless of configuration. When real
 * credentials aren't set, placeholder values keep passport-google-oauth20's
 * constructor (which throws on missing clientID/clientSecret) happy; actual
 * use is blocked earlier by GoogleAuthGuard, which checks configuration via
 * ConfigService and returns 501 before Passport ever runs this strategy. */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService<Env, true>) {
    super({
      clientID: configService.get("GOOGLE_CLIENT_ID", { infer: true }) ?? "not-configured",
      clientSecret: configService.get("GOOGLE_CLIENT_SECRET", { infer: true }) ?? "not-configured",
      callbackURL:
        configService.get("GOOGLE_CALLBACK_URL", { infer: true }) ??
        "http://localhost/not-configured",
      scope: ["email", "profile"],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error("Google account has no email address."), undefined);
      return;
    }
    const payload: GoogleOAuthPayload = {
      providerAccountId: profile.id,
      email,
      name: profile.displayName || email,
    };
    done(null, payload);
  }
}
