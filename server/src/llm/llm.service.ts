import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import OpenAI from 'openai';
import { Model } from 'src/model/entities/model.entity';
import ollama from 'ollama';
import { LlmInterfaces } from 'src/types/reports.types';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  wait(ms: number) {
    return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
  }

  completion(content: string, model: Model) {
    switch (model.llmInterface) {
      case LlmInterfaces.OpenAi:
        return this.handleOpenAi(content, model);

      case LlmInterfaces.Ollama:
        return this.handleOllama(content, model);
    }
  }

  private async handleOpenAi(content: string, model: Model) {
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

    return completion.choices[0].message.content;
  }

  private async handleOllama(content: string, model: Model) {
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

        await this.wait(10000);

        return this.query(content, model, count + 1);
      }

      return result;
    } catch (error: unknown) {
      if (count >= 5) {
        this.logger.warn(`Превышено максимальное количество запросов к [${model.name}]`);

        throw new BadRequestException('Не получилось выполнить проверку.');
      }

      console.log(error);

      this.logger.warn(
        `Не удалось получить ответ от [${model.name}]. Выполнение повторного запроса`,
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
