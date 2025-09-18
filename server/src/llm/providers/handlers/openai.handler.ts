import { Model } from 'src/model/entities/model.entity';
import { ILlmProviderHandler } from '../llm-provider.interface';
import OpenAI from 'openai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OpenAiHandler implements ILlmProviderHandler {
  processError(error: unknown) {
    const isInstance = error instanceof OpenAI.APIError;

    if (!isInstance) {
      return;
    }

    console.log(error);

    switch (error.status) {
      case 400: {
        throw new Error(error.message);
      }
    }
  }

  async completion(content: string, model: Model) {
    if (!model.provider || !model.key) {
      throw new Error('No provider or key specified for the model');
    }

    const {
      value: modelName,
      provider: { url: baseURL },
      key: { value: apiKey },
    } = model;

    const openai = new OpenAI({
      baseURL,
      apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'user',
          content,
        },
      ],
      top_p: model.top_p,
      max_tokens: model.max_tokens,
      temperature: model.temperature,
    });

    const result = completion.choices[0].message.content;

    if (!result) {
      throw new Error(`Received empty response from model [${modelName}]`);
    }

    return result;
  }
}
