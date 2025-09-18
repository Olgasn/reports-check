import { ILab } from '@@types';

export type CbFunc = () => void;

export interface LabProps {
  courseId: number;
  item: ILab;
}

export interface GetLabParams {
  editCb: CbFunc;
  deleteCb: CbFunc;
  openCb: CbFunc;
  checkCb: CbFunc;
  resultCb: CbFunc;
}
