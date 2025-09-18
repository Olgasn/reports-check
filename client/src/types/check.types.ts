import { IGroup } from './group.types';
import { ILab } from './lab.types';
import { IModel } from './settings.types';
import { IStudent, IStudentParsed } from './student.types';

export interface ICheckStudent {
  id: number;
  name: string;
  surname: string;
  middlename: string;
  num: string;
}

export interface ICheckItem {
  grade: number;
  advantages: string;
  disadvantages: string;
  review: string;
  date: string;
  model: IModel;
  report: string;
}

export interface IGroupCheck {
  student: ICheckStudent;
  checks: ICheckItem[];
}

export interface ICheckResult {
  group: IGroup;
  results: IGroupCheck[];
}

export interface ICheckData {
  reportsZip: File;
  labId: number;
  modelsId: number[];
  studentsId: IStudentParsed[];
  groupId: number;
  checkPrev?: boolean;
}

export interface ICheck {
  id: number;
  advantages: string;
  disadvantages: string;
  review: string;
  grade: number;
  student: IStudent;
  model: IModel;
  lab: ILab;
  report: string;
  date: string;
}

export interface IWsCheckResult {
  status: 'error' | 'success';
  ids?: string[];
}

export interface IGetChecks {
  ids: number[];
}
