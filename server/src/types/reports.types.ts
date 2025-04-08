export interface ReportCheck {
  name: string;
  surname: string;
  middlename: string;
  num: string;
  content: string;
}

export enum Providers {
  OpenRouter = 'openrouter',
  Ollama = 'ollama',
}
