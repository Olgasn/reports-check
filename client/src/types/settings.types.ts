export enum Providers {
  OpenRouter = 'openrouter',
  Ollama = 'ollama',
}

export interface IKey {
  id: number;
  name: string;
  value: string;
}

export interface ICreateKey {
  name: string;
  value: string;
}

export interface IUpdateKey extends ICreateKey {
  id: number;
}

export interface IModel extends ICreateModel {
  id: number;
  key: IKey;
}

export type IUpdateModel = ICreateModel;

export interface ICreateModel {
  name: string;
  value: string;
  top_p: number;
  keyId: number;
  temperature: number;
  max_tokens: number;
  provider: Providers;
}
