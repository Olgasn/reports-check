import { ICheckItem } from '@@types';

export interface StudentResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ICheckItem;
  studentStr: string;
}
