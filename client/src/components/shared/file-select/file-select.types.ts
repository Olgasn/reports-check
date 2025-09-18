import { SxProps } from '@mui/material';

export interface FileSelectProps {
  onChange: (fiel: File | null) => void;
  sx?: SxProps;
  textFieldSx?: SxProps;
  accept?: string;
}
