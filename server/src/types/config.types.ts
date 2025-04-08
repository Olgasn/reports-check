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
}

export interface ModelsConfig {
  openRouterUrl: string;
}
