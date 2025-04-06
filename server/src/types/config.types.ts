export interface Config {
  db: DbConfig;
  prompt: PromptConfig;
}

export interface DbConfig {
  database: string;
}

export interface PromptConfig {
  template: string;
}
