import { ExecutionContext, Injectable, NotImplementedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import type { Env } from "../config/env.validation";

/** Guards both /google and /google/callback. Checks configuration itself
 * (rather than always delegating to Passport) so an unconfigured deployment
 * returns a clean 501 instead of Passport's "Unknown authentication
 * strategy" error — GoogleStrategy is only registered as a provider when
 * credentials are present (see auth.module.ts). */
@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  constructor(private readonly configService: ConfigService<Env, true>) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.configService.get("GOOGLE_CLIENT_ID", { infer: true })) {
      throw new NotImplementedException("Google sign-in is not configured on this deployment yet.");
    }
    return super.canActivate(context);
  }
}
