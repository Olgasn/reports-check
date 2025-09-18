import { ModuleRef } from '@nestjs/core';
import { LlmInterfaces } from 'src/types/reports.types';
import { OllamaHandler } from './handlers/ollama.handler';
import { OpenAiHandler } from './handlers/openai.handler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ModelFabric {
  constructor(private readonly moduleRef: ModuleRef) {}

  create(modelInterface: LlmInterfaces) {
    switch (modelInterface) {
      case LlmInterfaces.Ollama: {
        return this.moduleRef.get(OllamaHandler);
      }

      case LlmInterfaces.OpenAi: {
        return this.moduleRef.get(OpenAiHandler);
      }
    }
  }
}
