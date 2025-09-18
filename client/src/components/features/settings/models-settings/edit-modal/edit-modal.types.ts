import { IModel } from '@@types';

export interface EditModalProps {
  isShow: boolean;
  handleClose: () => void;
  item: IModel;
}
