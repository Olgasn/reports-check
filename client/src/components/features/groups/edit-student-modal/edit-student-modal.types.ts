import { IStudent } from '@@types';

export interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  item: IStudent;
}
