import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ANALYSIS_QUEUE } from "./queue.constants";
import { AnalysisProcessor } from "./analysis.processor";
import { analysisProviderFactory } from "./analysis-provider.provider";

@Module({
  imports: [BullModule.registerQueue({ name: ANALYSIS_QUEUE })],
  providers: [AnalysisProcessor, analysisProviderFactory],
  // Re-exporting BullModule gives TranscriptionModule the Queue provider it
  // needs to enqueue a job once a Transcript is saved, without
  // TranscriptionModule registering the same queue a second time — same
  // pattern TranscriptionModule already uses for FilesModule.
  exports: [BullModule],
})
export class AnalysisModule {}
