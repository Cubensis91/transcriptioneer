import { Module } from "@nestjs/common";
import { TranscriptionModule } from "../transcription/transcription.module";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { StorageService } from "./storage.service";

@Module({
  // TranscriptionModule re-exports BullModule so FilesService can inject
  // the transcription Queue and enqueue a job on upload confirmation,
  // without duplicating the queue registration here.
  imports: [TranscriptionModule],
  controllers: [FilesController],
  providers: [FilesService, StorageService],
})
export class FilesModule {}
