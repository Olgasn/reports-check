export interface ApiKey {
  id: number;
  name: string;
  value: string;
}

export interface Model {
  id: number;
  name: string;
  value: string;
  key: ApiKey;
  top_p: number;
  temperature: number;
  max_tokens: number;
}
