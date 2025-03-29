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
}
