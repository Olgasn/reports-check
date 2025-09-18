import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { OllamaHandler } from './providers/handlers/ollama.handler';
import { OpenAiHandler } from './providers/handlers/openai.handler';
import { LlmProviderFactory } from './providers/llm-provider.factory';

@Module({
  providers: [LlmService, OllamaHandler, OpenAiHandler, LlmProviderFactory],
  exports: [LlmService],
})
export class LlmModule {}
