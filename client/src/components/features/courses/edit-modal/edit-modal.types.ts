import { ICourse } from '@@types';

export interface EditModalProps {
  isShow: boolean;
  handleClose: () => void;
  item: ICourse;
}
