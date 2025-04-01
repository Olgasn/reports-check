import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import OpenAI from 'openai';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  wait(ms: number) {
    return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
  }

  async completion(content: string, model: string, key: string) {
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: key,
    });

    if (model.toLowerCase().includes('gemini')) {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: content,
              },
            ],
          },
        ],
      });

      return completion.choices[0].message.content;
    }

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    });

    return completion.choices[0].message.content;
  }

  async query(content: string, model: string, key: string, count = 0): Promise<string> {
    await this.wait(10000);

    try {
      const result = await this.completion(content, model, key);

      if (!result) {
        if (count >= 5) {
          this.logger.warn(`Превышено максимальное количество запросов к [${model}]`);

          throw new BadRequestException('Не получилось выполнить проверку.');
        }

        this.logger.warn(`Пустой ответ от модели [${model}]. Выполнение повторного запроса`);

        await this.wait(20000);

        return this.query(content, model, key, count);
      }

      return result;
    } catch {
      if (count >= 5) {
        this.logger.warn(`Превышено максимальное количество запросов к [${model}]`);

        throw new BadRequestException('Не получилось выполнить проверку.');
      }

      this.logger.warn(`не удалось получить ответ от [${model}]. Выполнение повторного запроса`);

      await this.wait(20000);

      return this.query(content, model, key, count);
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
