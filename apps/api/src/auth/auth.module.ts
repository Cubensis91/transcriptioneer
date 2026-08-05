import { Module, type Provider } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleAuthGuard } from "./google-auth.guard";
import { GoogleStrategy } from "./google.strategy";
import { JwtStrategy } from "./jwt.strategy";

// GoogleStrategy's constructor (via passport-google-oauth20) throws if
// clientID/clientSecret are missing, so it's only registered as a provider
// when all three env vars are present — checked here at module-definition
// time (process.env directly; ConfigService isn't available yet at this
// point in the bootstrap). GoogleAuthGuard checks the same condition per-
// request via ConfigService, so an unconfigured deployment gets a clean 501
// rather than Nest failing to resolve an unregistered provider.
const providers: Provider[] = [AuthService, JwtStrategy, GoogleAuthGuard];
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {
  providers.push(GoogleStrategy);
}

@Module({
  imports: [
    PassportModule,
    // Registered with no default secret/options — every sign()/verify() call
    // in AuthService passes its own secret + expiresIn explicitly, since
    // access and refresh tokens use different secrets (see env.validation.ts).
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers,
  exports: [AuthService],
})
export class AuthModule {}
