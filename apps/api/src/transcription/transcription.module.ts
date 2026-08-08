import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { AnalysisModule } from "../analysis/analysis.module";
import { StorageService } from "../files/storage.service";
import { TRANSCRIPTION_QUEUE } from "./queue.constants";
import { TranscriptionProcessor } from "./transcription.processor";
import { whisperProviderFactory } from "./whisper-provider.provider";

@Module({
  // AnalysisModule re-exports BullModule so TranscriptionProcessor can
  // inject the analysis Queue and enqueue a job once a Transcript is saved
  // (Milestone 6), same pattern as FilesService below.
  imports: [BullModule.registerQueue({ name: TRANSCRIPTION_QUEUE }), AnalysisModule],
  providers: [TranscriptionProcessor, whisperProviderFactory, StorageService],
  // Re-exporting BullModule gives FilesModule the Queue provider it needs
  // to enqueue a job on upload confirmation, without FilesModule having to
  // register the same queue a second time.
  exports: [BullModule],
})
export class TranscriptionModule {}
