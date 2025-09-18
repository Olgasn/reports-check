import { Model } from 'src/model/entities/model.entity';
import { ILlmProviderHandler } from '../llm-provider.interface';
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

  async completion(content: string, model: Model) {
    const { value: modelName, top_p, temperature } = model;
    const ollama = new Ollama();

    const response = await ollama.chat({
      model: modelName,
      messages: [{ role: 'user', content }],
      options: {
        top_p,
        temperature,
      },
    });

    return response.message.content;
  }
}
