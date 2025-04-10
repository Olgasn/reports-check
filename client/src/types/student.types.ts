import { IGroup } from './group.types';

export interface IStudent extends Omit<ICreateStudent, 'groupId'> {
  id: number;
  group: IGroup | null;
}

export interface ICreateStudent {
  name: string;
  surname: string;
  middlename: string;
  num: string;
  groupId: number;
}

export type IUpdateStudent = ICreateStudent;
