import { FC, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useKeys, useUpdateModel } from '@api';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { Modal } from '@components';
import { COLORS } from '@constants';
import { toast } from 'react-toastify';
import { Providers } from '@@types';
import { EditModalProps } from './edit-modal.types';
import { EditModalFormData, EditModalSchema } from './edit-modal.validation';

export const EditModal: FC<EditModalProps> = ({ isShow, handleClose, item }) => {
  const { data } = useKeys();
  const [provider, setProvider] = useState<Providers>(item.provider);

  const onSuccess = () => {
    toast.success('Модель успешно обновлена');

    handleClose();
  };

  const onError = () => {
    toast.error('Не удалось обновить модель');

    handleClose();
  };

  const formRef = useRef<HTMLFormElement | null>(null);
  const { mutate: updateModel } = useUpdateModel();

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(EditModalSchema),
    defaultValues: {
      key: item.key.id,
      name: item.name,
      value: item.value,
      top_p: item.top_p,
      temperature: item.temperature,
      max_tokens: item.max_tokens,
    },
  });

  const onSubmit = (data: EditModalFormData) => {
    const reqData = {
      data: {
        keyId: data.key,
        name: data.name,
        value: data.value,
        provider,
        top_p: data.top_p,
        temperature: data.temperature,
        max_tokens: data.max_tokens,
      },
      id: item.id,
    };

    updateModel(reqData, {
      onSuccess,
      onError,
    });
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
        Сохранить
      </Button>
    </Box>
  );

  return (
    <Modal
      body={modalBody}
      open={isShow}
      onClose={handleClose}
      title="Обновление модели"
      footer={modalFooter}
      sx={{ width: '500px' }}
    />
  );
};
