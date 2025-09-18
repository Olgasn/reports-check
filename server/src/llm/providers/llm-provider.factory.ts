import { Injectable } from '@nestjs/common';
import { LlmInterfaces } from 'src/types/reports.types';
import { ILlmProviderHandler } from './llm-provider.interface';
import { OpenAiHandler } from './handlers/openai.handler';
import { OllamaHandler } from './handlers/ollama.handler';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class LlmProviderFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  create(llmInterface: LlmInterfaces): ILlmProviderHandler {
    switch (llmInterface) {
      case LlmInterfaces.OpenAi: {
        return this.moduleRef.get(OpenAiHandler);
      }

      case LlmInterfaces.Ollama: {
        return this.moduleRef.get(OllamaHandler);
      }
    }
  }
}
