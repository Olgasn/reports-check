import { useId } from 'react';

import {
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Box,
  Chip,
  MenuItem,
  FormHelperText,
} from '@mui/material';

import { FieldValues, Controller } from 'react-hook-form';

import { MultiSelectProps } from './multi-select.types';

export const MultiSelect = <T extends FieldValues, K>({
  name,
  control,
  options,
  valueKey,
  labelKey,
  label = 'Выберите',
  selectProps,
  disabled,
}: MultiSelectProps<T, K>) => {
  const labelId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error}>
          <InputLabel id={labelId} size="small">
            {label}
          </InputLabel>
          <Select
            {...field}
            multiple
            labelId={labelId}
            input={<OutlinedInput label={label} size="small" />}
            size="small"
            disabled={disabled}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as Array<K[keyof K]>).map((value) => {
                  const option = options.find((opt) => opt[valueKey] === value);
                  return (
                    <Chip
                      key={String(value)}
                      label={option ? String(option[labelKey]) : String(value)}
                    />
                  );
                })}
              </Box>
            )}
            {...selectProps}
            sx={{
              background: 'white',
            }}
          >
            {options.map((option) => (
              <MenuItem key={String(option[valueKey])} value={option[valueKey] as string | number}>
                {String(option[labelKey])}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};
