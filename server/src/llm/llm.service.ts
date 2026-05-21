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

    const jsonString = this.normalizeJsonBlock(jsonMatch[1].trim());
    const jsonData = this.parseModelJson(jsonString);

    const instance = plainToInstance(cls, jsonData);
    const errors = await validate(instance as unknown as object);

    if (errors.length > 0) {
      const errorMessages = errors.flatMap((error) => Object.values(error.constraints || {}));

      throw new Error(`Validation error: ${errorMessages.join(', ')}`);
    }

    return instance;
  }

  normalizeJsonBlock(json: string) {
    return json
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  parseModelJson(json: string) {
    const sanitized = this.escapeControlCharsInStrings(json);
    const sanitizedWithoutTrailingCommas = this.removeTrailingCommas(sanitized);
    const attempts = [json, sanitized, sanitizedWithoutTrailingCommas];

    for (let i = 0; i < attempts.length; i++) {
      const current = attempts[i];

      try {
        if (i > 0) {
          this.logger.warn(`Используется fallback-парсинг JSON ответа модели, попытка ${i + 1}`);
        }

        return JSON.parse(current);
      } catch (error) {
        if (i === attempts.length - 1) {
          throw new Error(`Failed to parse JSON: ${error.message}`);
        }
      }
    }

    throw new Error('Failed to parse JSON: unknown parsing error');
  }

  escapeControlCharsInStrings(raw: string) {
    let result = '';
    let inString = false;
    let escaped = false;

    for (let i = 0; i < raw.length; i++) {
      const char = raw[i];

      if (!inString) {
        if (char === '"') {
          inString = true;
        }

        result += char;

        continue;
      }

      if (escaped) {
        result += char;
        escaped = false;

        continue;
      }

      if (char === '\\') {
        result += char;
        escaped = true;

        continue;
      }

      if (char === '"') {
        result += char;
        inString = false;

        continue;
      }

      switch (char) {
        case '\n': {
          result += '\\n';

          break;
        }

        case '\r': {
          result += '\\r';

          break;
        }

        case '\t': {
          result += '\\t';

          break;
        }

        default: {
          const code = char.charCodeAt(0);

          if (code < 0x20) {
            result += ' ';
          } else {
            result += char;
          }
        }
      }
    }

    return result;
  }

  removeTrailingCommas(json: string) {
    return json.replace(/,\s*([}\]])/g, '$1');
  }
}
