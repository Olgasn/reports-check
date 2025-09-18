import { Injectable, Logger } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Model } from 'src/model/entities/model.entity';
import { LlmProviderFactory } from './providers/llm-provider.factory';
import { wait } from 'src/common/helpers/wait.helper';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly llmProviderFactory: LlmProviderFactory) {}

  async query(content: string, model: Model) {
    const { maxRetries, queryDelay, errorDelay } = model;
    const provider = this.llmProviderFactory.create(model.llmInterface);

    for (let i = 1; i <= maxRetries; i++) {
      await wait(queryDelay);

      try {
        const result = await provider.completion(content, model);

        if (!result) {
          this.logger.warn(`Пустой ответ от модели [${model.name}]. Выполнение повторного запроса`);

          await wait(errorDelay);

          continue;
        }

        return result;
      } catch (error: unknown) {
        provider.processError(error);

        this.logger.warn(
          `Ошибка при обращении к модели [${model.name}]. Выполнение повторного запроса`,
        );

        console.log(error);

        await wait(errorDelay);
      }
    }

    this.logger.warn(`Превышено максимальное количество запросов к [${model.name}]`);

    throw new Error('Не получилось выполнить проверку.');
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
