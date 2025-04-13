import { IGroup } from './group.types';
import { ILab } from './lab.types';
import { Model } from './settings.types';
import { IStudent } from './student.types';

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
  model: Model;
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
  groupId: number;
}

export interface ICheck {
  id: number;
  advantages: string;
  disadvantages: string;
  review: string;
  grade: number;
  student: IStudent;
  model: Model;
  lab: ILab;
  report: string;
}
