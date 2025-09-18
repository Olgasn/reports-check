import { IKey } from '@@types';

export interface EditModalProps {
  isShow: boolean;
  handleClose: () => void;
  item: IKey;
}
