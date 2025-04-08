export enum Providers {
  OpenRouter = 'openrouter',
  Ollama = 'ollama',
}

export interface ApiKey {
  id: number;
  name: string;
  value: string;
}

export interface Model extends ICreateModel {
  id: number;

  key: ApiKey;
}

export interface ICreateModel {
  name: string;
  value: string;
  top_p: number;
  keyId: number;
  temperature: number;
  max_tokens: number;
  provider: Providers;
}
