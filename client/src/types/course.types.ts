import { IPrompt } from './prompt.types';

export interface ICourse {
  id: number;
  name: string;
  description: string;
  prompt: IPrompt | null;
}

export interface ICreateCourse {
  name: string;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IEditCourse extends ICreateCourse {}
