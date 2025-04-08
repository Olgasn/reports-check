import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import OpenAI from 'openai';
import { Model } from 'src/model/entities/model.entity';
import { ModelsConfig } from 'src/types/config.types';
import { Providers } from 'src/types/reports.types';
import ollama from 'ollama';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly url: string;

  constructor(private readonly configService: ConfigService) {
    const { openRouterUrl } = this.configService.get<ModelsConfig>('models')!;

    this.url = openRouterUrl;
  }

  wait(ms: number) {
    return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
  }

  completion(content: string, model: Model) {
    switch (model.provider) {
      case Providers.OpenRouter:
        return this.handleOpenRouter(content, model);
      case Providers.Ollama:
        return this.handleOllama(content, model);
      default:
        return null;
    }
  }

  private async handleOpenRouter(content: string, model: Model) {
    const openai = new OpenAI({
      baseURL: this.url,
      apiKey: model.key.value,
    });

    const isGemini = model.value.toLowerCase().includes('gemini');

    const completion = await openai.chat.completions.create({
      model: model.value,
      messages: [
        {
          role: 'user',
          content: isGemini ? [{ type: 'text', text: content }] : content,
        },
      ],
      top_p: model.top_p,
      max_tokens: model.max_tokens,
      temperature: model.temperature,
    });

    return completion.choices[0].message.content;
  }

  private async handleOllama(content: string, model: Model) {
    const response = await ollama.chat({
      model: model.value,
      messages: [{ role: 'user', content }],
      options: {
        top_p: model.top_p,
        temperature: model.temperature,
      },
    });

    return response.message.content;
  }

  async query(content: string, model: Model, count = 0) {
    await this.wait(10000);

    try {
      const result = await this.completion(content, model);

      if (!result) {
        if (count >= 5) {
          this.logger.warn(`Превышено максимальное количество запросов к [${model.name}]`);

          throw new BadRequestException('Не получилось выполнить проверку.');
        }

        this.logger.warn(`Пустой ответ от модели [${model.name}]. Выполнение повторного запроса`);

        await this.wait(20000);

        return this.query(content, model, count + 1);
      }

      return result;
    } catch {
      if (count >= 5) {
        this.logger.warn(`Превышено максимальное количество запросов к [${model.name}]`);

        throw new BadRequestException('Не получилось выполнить проверку.');
      }

      this.logger.warn(
        `не удалось получить ответ от [${model.name}]. Выполнение повторного запроса`,
      );

      await this.wait(20000);

      return this.query(content, model, count + 1);
    }
  }

  async extractData<T>(cls: ClassConstructor<T>, content: string): Promise<T> {
    const jsonRegex = /<JSON>([\s\S]*?)<\/JSON>/i;
    const jsonMatch = content.match(jsonRegex);

    if (!jsonMatch) {
      throw new Error('JSON block not found in the content');
    }

    const jsonString = jsonMatch[1].trim();
    let jsonData: unknown;

    try {
      jsonData = JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }

    const instance = plainToInstance(cls, jsonData);
    const errors = await validate(instance as unknown as object);

    if (errors.length > 0) {
      const errorMessages = errors.flatMap((error) => Object.values(error.constraints || {}));

      throw new Error(`Validation error: ${errorMessages.join(', ')}`);
    }

    return instance;
  }
}
