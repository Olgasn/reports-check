import { IModel } from '@@types';

export interface ResultItemProps {
  grade: number;
  model: IModel;
  review: string;
  advantages: string;
  disadvantages: string;
  date: string;
}
