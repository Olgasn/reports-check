import { ILab } from '@@types';

export interface EditLabModalProps {
  onClose: () => void;
  isOpen: boolean;
  item: ILab;
}
