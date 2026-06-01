import { IModel } from '@@types';

export interface CheckCopyBtnProps {
  grade: number;
  advantages: string;
  disadvantages: string;
  review: string;
  date: string;
  model: IModel;
  studentStr: string;
  promptInjectionDetected?: boolean;
  promptInjectionRisk?: string;
  promptInjectionFragments?: string;
  securityComment?: string;
}
