import { IStudent } from '@@types';

export interface StudentItemProps {
  item: IStudent;
  editCb: () => void;
}
