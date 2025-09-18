export enum LlmInterfaces {
  Ollama = 'Ollama',
  OpenAi = 'OpenAi',
}

export interface IKey {
  id: number;
  name: string;
  value: string;
}

export interface IProvider {
  id: number;
  name: string;
  url: string;
}

export type ICreateProvider = Pick<IProvider, 'name' | 'url'>;

export type IUpdateProvider = ICreateProvider;

export interface ICreateKey {
  name: string;
  value: string;
}

export interface IUpdateKey extends ICreateKey {
  id: number;
}

export interface IModel extends ICreateModel {
  id: number;
  key: IKey | null;
  provider: IProvider | null;
}

export type IUpdateModel = ICreateModel;

export interface ICreateModel {
  name: string;
  value: string;
  top_p: number;
  keyId?: number;
  providerId?: number;
  temperature: number;
  max_tokens: number;
  maxRetries: number;
  queryDelay: number;
  errorDelay: number;
  llmInterface: LlmInterfaces;
}
