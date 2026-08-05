import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "@transcriptioneer/validation";
import type { LoginInput, RegisterInput } from "@transcriptioneer/validation";
import type {
  ApiResponse,
  AuthSession,
  AuthenticatedUser,
  Organization,
} from "@transcriptioneer/types";
import { AuthService, type IssuedTokens } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { ZodValidationPipe } from "./pipes/zod-validation.pipe";
import type { Env } from "../config/env.validation";

const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@Controller("api/v1/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  @Post("register")
  @HttpCode(201)
  @Throttle(AUTH_THROTTLE)
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(
    @Body() input: RegisterInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthSession>> {
    const { session, tokens } = await this.authService.register(input);
    this.setAuthCookies(res, tokens);
    return { success: true, data: session };
  }

  @Post("login")
  @HttpCode(200)
  @Throttle(AUTH_THROTTLE)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() input: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthSession>> {
    const { session, tokens } = await this.authService.login(input);
    this.setAuthCookies(res, tokens);
    return { success: true, data: session };
  }

  @Post("refresh")
  @HttpCode(200)
  @Throttle(AUTH_THROTTLE)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<AuthSession>> {
    const rawRefreshToken = this.readRefreshCookie(req);
    if (!rawRefreshToken) {
      throw new UnauthorizedException("No refresh token provided.");
    }
    const { session, tokens } = await this.authService.refresh(rawRefreshToken);
    this.setAuthCookies(res, tokens);
    return { success: true, data: session };
  }

  @Post("logout")
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    const rawRefreshToken = this.readRefreshCookie(req);
    if (rawRefreshToken) {
      await this.authService.logout(rawRefreshToken);
    }
    this.clearAuthCookies(res);
    return { success: true, data: null };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser): Promise<ApiResponse<AuthSession>> {
    const session = await this.authService.getSessionForUser(user.sub);
    return { success: true, data: session };
  }

  /** Protected endpoint used to prove org scoping is enforced at the
   * repository layer, not just the guard: requesting an organizationId the
   * caller isn't a member of returns 403, never another org's data. */
  @Get("organizations/:id")
  @UseGuards(JwtAuthGuard)
  async getOrganization(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") organizationId: string,
  ): Promise<ApiResponse<Organization>> {
    const organization = await this.authService.getOrganizationForUser(user, organizationId);
    return { success: true, data: organization };
  }

  private readRefreshCookie(req: Request): string | null {
    const cookies = req.cookies as Record<string, string | undefined> | undefined;
    return cookies?.refresh_token ?? null;
  }

  private setAuthCookies(res: Response, tokens: IssuedTokens): void {
    const isProd = this.configService.get("NODE_ENV", { infer: true }) === "production";
    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: tokens.accessTtlSeconds * 1000,
    });
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: tokens.refreshTtlDays * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/api/v1/auth" });
  }
}
