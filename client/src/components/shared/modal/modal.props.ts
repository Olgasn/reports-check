import { SxProps } from '@mui/material';
import { ReactElement } from 'react';

export interface ModalProps {
  footer?: ReactElement;
  body: ReactElement;
  open: boolean;
  onClose: () => void;
  sx?: SxProps;
  title?: string;
}
