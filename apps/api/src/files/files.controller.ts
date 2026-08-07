import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { presignUploadSchema } from "@transcriptioneer/validation";
import type { PresignUploadInput } from "@transcriptioneer/validation";
import type {
  ApiResponse,
  AuthenticatedUser,
  PresignUploadResponse,
  SourceFile,
} from "@transcriptioneer/types";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ZodValidationPipe } from "../auth/pipes/zod-validation.pipe";
import { FilesService } from "./files.service";

@Controller("api/v1/files")
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("presign")
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(presignUploadSchema))
  async presign(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: PresignUploadInput,
  ): Promise<ApiResponse<PresignUploadResponse>> {
    const result = await this.filesService.presignUpload(user, input);
    return { success: true, data: result };
  }

  @Post(":id/complete")
  @HttpCode(200)
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<ApiResponse<SourceFile>> {
    const file = await this.filesService.confirmUpload(user, id);
    return { success: true, data: file };
  }

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser): Promise<ApiResponse<SourceFile[]>> {
    const files = await this.filesService.listFiles(user);
    return { success: true, data: files };
  }

  @Get(":id")
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<ApiResponse<SourceFile>> {
    const file = await this.filesService.getFile(user, id);
    return { success: true, data: file };
  }

  @Get(":id/download-url")
  async downloadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<ApiResponse<{ url: string }>> {
    const url = await this.filesService.getDownloadUrl(user, id);
    return { success: true, data: { url } };
  }

  @Delete(":id")
  @HttpCode(200)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<ApiResponse<null>> {
    await this.filesService.deleteFile(user, id);
    return { success: true, data: null };
  }
}
