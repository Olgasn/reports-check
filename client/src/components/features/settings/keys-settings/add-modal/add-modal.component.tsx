import { FC, useRef } from 'react';

import { Box, Button, TextField } from '@mui/material';

import { useCreateKey } from '@api';
import { COLORS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@shared';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { AddModalProps } from './add-modal.types';
import { AddModalFormData, AddModalSchema } from './add-modal.validation';

export const AddModal: FC<AddModalProps> = ({ isShow, handleClose }) => {
  const onSuccess = () => {
    toast.success('Ключ успешно добавлен');

    handleClose();
  };

  const onError = () => {
    toast.error('Не удалось добавить ключ');

    handleClose();
  };

  const formRef = useRef<HTMLFormElement | null>(null);
  const { mutate: createKey } = useCreateKey();

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(AddModalSchema),
  });

  const onSubmit = (data: AddModalFormData) => {
    createKey(data, {
      onSuccess,
      onError,
    });
  };

  const handleClickSubmit = () => {
    const { current } = formRef;

    current?.requestSubmit();
  };

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
      title="Создание ключа API"
      footer={modalFooter}
      sx={{ width: '500px' }}
    />
  );
};
