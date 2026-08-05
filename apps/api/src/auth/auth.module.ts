import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleAuthGuard } from "./google-auth.guard";
import { GoogleStrategy } from "./google.strategy";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    PassportModule,
    // Registered with no default secret/options — every sign()/verify() call
    // in AuthService passes its own secret + expiresIn explicitly, since
    // access and refresh tokens use different secrets (see env.validation.ts).
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  // GoogleStrategy is always registered — Passport needs the "google"
  // strategy to exist regardless of configuration, or every /google request
  // fails with "Unknown authentication strategy" (see google.strategy.ts for
  // how it stays inert without real credentials). GoogleAuthGuard is what
  // actually gates access based on whether GOOGLE_CLIENT_ID etc. are set.
  providers: [AuthService, JwtStrategy, GoogleAuthGuard, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
