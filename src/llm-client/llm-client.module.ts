import { Module } from '@nestjs/common';
import { LLMClientService } from './llm-client.service';

@Module({
  providers: [LLMClientService],
  exports: [LLMClientService],
})
export class LlmClientModule {}
