import { SelectProps as SelectPropsMui, SxProps } from '@mui/material';

import { Control, FieldValues, Path } from 'react-hook-form';

export interface SelectProps<T extends FieldValues, K> {
  name: Path<T>;
  control: Control<T>;
  data: K[];
  valueKey: keyof K;
  labelKey: keyof K;
  label?: string;
  selectProps?: SelectPropsMui;
  sx?: SxProps;
}
