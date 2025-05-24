import { Model } from 'src/model/entities/model.entity';
import { ILlmProviderHandler } from '../llm-provider.interface';
import ollama from 'ollama';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OllamaHandler implements ILlmProviderHandler {
  async completion(content: string, model: Model) {
    const { value: modelName, top_p, temperature } = model;

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
