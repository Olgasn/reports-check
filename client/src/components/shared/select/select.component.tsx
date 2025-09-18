import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  Select as SelectMui,
} from '@mui/material';

import { Controller, FieldValues } from 'react-hook-form';

import { SelectProps } from './select.types';

export const Select = <T extends FieldValues, K>({
  name,
  control,
  data,
  valueKey,
  labelKey,
  label,
  selectProps,
  sx,
}: SelectProps<T, K>) => {
  return (
    <Box sx={sx}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth error={!!error}>
            {label && <InputLabel size="small">{label}</InputLabel>}
            <SelectMui
              {...field}
              size="small"
              label={label}
              {...selectProps}
              sx={{ background: 'white' }}
              value={field.value}
            >
              {data.map((item) => (
                <MenuItem value={item[valueKey] as string | number} key={String(item[valueKey])}>
                  {String(item[labelKey])}
                </MenuItem>
              ))}
            </SelectMui>
            {error && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        )}
      />
    </Box>
  );
};
