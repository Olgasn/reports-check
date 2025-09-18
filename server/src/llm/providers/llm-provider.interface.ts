import { Model } from 'src/model/entities/model.entity';

export interface ILlmProviderHandler {
  completion(content: string, model: Model): Promise<string>;
  processError(error: unknown);
}
