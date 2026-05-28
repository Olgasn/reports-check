import { ReactElement } from 'react';

import { SxProps } from '@mui/material';

export interface ModalProps {
  footer?: ReactElement;
  body: ReactElement;
  open: boolean;
  onClose: () => void;
  sx?: SxProps;
  title?: string;
}
