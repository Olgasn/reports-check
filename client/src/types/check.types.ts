import { ILab } from './lab.types';
import { Model } from './settings.types';
import { IStudent } from './student.types';

export interface ICheckResult {
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

export interface ICheckData {
  reportsZip: File;
  labId: number;
  modelId: number;
}
