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

/** Only instantiated when GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL are all set —
 * see auth.module.ts. Without that, this class is never constructed, so
 * passport-google-oauth20's constructor (which throws on missing
 * clientID/clientSecret) never runs. */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService<Env, true>) {
    super({
      clientID: configService.get("GOOGLE_CLIENT_ID", { infer: true }),
      clientSecret: configService.get("GOOGLE_CLIENT_SECRET", { infer: true }),
      callbackURL: configService.get("GOOGLE_CALLBACK_URL", { infer: true }),
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
