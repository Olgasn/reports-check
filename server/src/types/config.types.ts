export interface Config {
  db: DbConfig;
  prompt: PromptConfig;
  models: ModelsConfig;
}

export interface DbConfig {
  database: string;
}

export interface PromptConfig {
  template: string;
  templateMultiple: string;
  templatePrev: string;
}

export interface ModelsConfig {
  openRouterUrl: string;
}
