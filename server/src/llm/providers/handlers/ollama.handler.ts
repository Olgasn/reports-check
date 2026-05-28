import { Model } from 'src/model/entities/model.entity';
import { ILlmProviderHandler } from '../llm-provider.interface';
import { SplitPrompt } from 'src/prompt/prompt.service';
import { Ollama, ErrorResponse } from 'ollama';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OllamaHandler implements ILlmProviderHandler {
  isOllamaError(error: any): error is ErrorResponse {
    return 'message' in error;
  }

  processError(error: unknown) {
    const isInstance = this.isOllamaError(error);

    if (!isInstance) {
      return;
    }

    throw new Error(error.error);
  }

  async completion({ system, user }: SplitPrompt, model: Model) {
    const { value: modelName, top_p, temperature } = model;
    const ollama = new Ollama();

    const messages: { role: string; content: string }[] = [];

    if (system) {
      messages.push({ role: 'system', content: system });
    }

    messages.push({ role: 'user', content: user });

    const response = await ollama.chat({
      model: modelName,
      messages,
      options: {
        top_p,
        temperature,
      },
    });

    return response.message.content;
  }
}
