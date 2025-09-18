import { SelectProps } from '@mui/material';

import { FieldValues, Control, Path } from 'react-hook-form';

export interface MultiSelectProps<T extends FieldValues, K> {
  name: Path<T>;
  control: Control<T>;
  options: K[];
  valueKey: keyof K;
  labelKey: keyof K;
  label?: string;
  selectProps?: SelectProps;
  disabled?: boolean;
}
