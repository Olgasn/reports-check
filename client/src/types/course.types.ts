import { IPagination } from './common.types';
import { ILab } from './lab.types';
import { IPrompt } from './prompt.types';

export interface ICourse {
  id: number;
  name: string;
  description: string;
  prompt: IPrompt | null;
}

export interface ICoursePagination extends IPagination {
  name: string;
}

export interface ICreateCourse {
  name: string;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IEditCourse extends ICreateCourse {}

export interface ILabAll {
  id: number;
  name: string;
}

export interface ICourseAll {
  id: number;
  name: string;
  labs: ILab[];
}

export interface ICourseSimple {
  id: number;
  name: string;
}
