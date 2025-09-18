import { IProvider } from '@@types';

export interface EditModalProps {
  isShow: boolean;
  handleClose: () => void;
  item: IProvider;
}
