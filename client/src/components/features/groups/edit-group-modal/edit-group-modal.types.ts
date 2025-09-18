import { IGroup } from '@@types';

export interface EditGroupModalProps {
  isShow: boolean;
  handleClose: () => void;
  item: IGroup;
}
