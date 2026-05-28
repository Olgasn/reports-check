import { Model } from 'src/model/entities/model.entity';
import { SplitPrompt } from 'src/prompt/prompt.service';

export interface ILlmProviderHandler {
  completion(prompt: SplitPrompt, model: Model): Promise<string>;
  processError(error: unknown);
}
