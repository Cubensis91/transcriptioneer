import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** Rejects unauthenticated requests (missing/invalid/expired access token);
 * on success attaches `AuthenticatedUser` to `req.user` via JwtStrategy. */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
