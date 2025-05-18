import { IPagination } from './common.types';
import { IGroup } from './group.types';

export interface IStudent extends Omit<ICreateStudent, 'groupId'> {
  id: number;
  group: IGroup | null;
}

export interface ICreateStudent {
  name: string;
  surname: string;
  middlename: string;
  groupId: number;
}

export type IUpdateStudent = ICreateStudent;

export interface ISearchStudents extends IPagination {
  search?: string;
  groupId: number;
}
