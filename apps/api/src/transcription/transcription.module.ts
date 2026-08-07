import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { StorageService } from "../files/storage.service";
import { TRANSCRIPTION_QUEUE } from "./queue.constants";
import { TranscriptionProcessor } from "./transcription.processor";
import { whisperProviderFactory } from "./whisper-provider.provider";

@Module({
  imports: [BullModule.registerQueue({ name: TRANSCRIPTION_QUEUE })],
  providers: [TranscriptionProcessor, whisperProviderFactory, StorageService],
  // Re-exporting BullModule gives FilesModule the Queue provider it needs
  // to enqueue a job on upload confirmation, without FilesModule having to
  // register the same queue a second time.
  exports: [BullModule],
})
export class TranscriptionModule {}
