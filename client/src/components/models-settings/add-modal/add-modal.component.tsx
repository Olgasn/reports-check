import { FC, useId, useRef, useState } from 'react';
import { AddModalProps } from './add-modal.types';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AddModalFormData, AddModalSchema } from './add-modal.validation';
import { useCreateModel, useKeys } from '@api';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { Modal } from '@components';
import { COLORS } from '@constants';
import { toast } from 'react-toastify';
import { Providers } from '@@types';

export const AddModal: FC<AddModalProps> = ({ isShow, handleClose }) => {
  const { data } = useKeys();
  const [provider, setProvider] = useState<Providers>(Providers.OpenRouter);

  const onSuccess = () => {
    toast.success('Модель успешно добавлена');

    handleClose();
  };

  const onError = () => {
    toast.error('Не удалось добавить модель');

    handleClose();
  };

  const formRef = useRef<HTMLFormElement | null>(null);
  const { mutate: createModel } = useCreateModel();

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(AddModalSchema),
  });

  const onSubmit = (data: AddModalFormData) => {
    createModel(
      {
        keyId: data.key,
        name: data.name,
        value: data.value,
        provider,
        top_p: data.top_p,
        temperature: data.temperature,
        max_tokens: data.max_tokens,
      },
      {
        onSuccess,
        onError,
      }
    );
  };

  const handleClickSubmit = () => {
    const { current } = formRef;

    current?.requestSubmit();
  };

  const handleProviderChange = (e: SelectChangeEvent<Providers>) =>
    setProvider(e.target.value as Providers);

  if (!data) {
    return null;
  }

  const modalBody = (
    <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
      <Box display="flex" flexDirection="column">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Название"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              size="small"
            />
          )}
        />

        <Controller
          name="value"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Значение"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={{
                mt: 2,
              }}
              size="small"
            />
          )}
        />

        <Controller
          name="temperature"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Температура"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={{
                mt: 2,
              }}
              size="small"
            />
          )}
        />

        <Controller
          name="top_p"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Top_p"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={{
                mt: 2,
              }}
              size="small"
            />
          )}
        />

        <Controller
          name="max_tokens"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Max tokens"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={{
                mt: 2,
              }}
              size="small"
            />
          )}
        />

        <FormControl fullWidth>
          <Select value={provider} onChange={handleProviderChange} size="small" sx={{ mt: 2 }}>
            <MenuItem value={Providers.Ollama}>{Providers.Ollama}</MenuItem>
            <MenuItem value={Providers.OpenRouter}>{Providers.OpenRouter}</MenuItem>
          </Select>
        </FormControl>

        <Controller
          name="key"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormControl fullWidth error={!!error}>
              <Select {...field} size="small" sx={{ mt: 2 }}>
                {data.map(({ id, name }) => (
                  <MenuItem value={id} key={id}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
              {error && <FormHelperText>{error.message}</FormHelperText>}
            </FormControl>
          )}
        />
      </Box>
    </form>
  );

  const modalFooter = (
    <Box display="flex" flexDirection="row">
      <Button
        variant="contained"
        sx={{
          background: COLORS.MENU_BG,
          flexGrow: 1,
        }}
        onClick={handleClickSubmit}
      >
        Создать
      </Button>
    </Box>
  );

  return (
    <Modal
      body={modalBody}
      open={isShow}
      onClose={handleClose}
      title="Добавление модели"
      footer={modalFooter}
      sx={{ width: '500px' }}
    />
  );
};
