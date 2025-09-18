import { FC, useRef } from 'react';

import { Box, Button, TextField } from '@mui/material';

import { useCreateProvider } from '@api';
import { COLORS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@shared';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { AddModalProps } from './add-modal.types';
import { AddModalFormData, AddModalSchema } from './add-modal.validation';

export const AddModal: FC<AddModalProps> = ({ isShow, handleClose }) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const { mutate: createProvider } = useCreateProvider();

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(AddModalSchema),
  });

  const modalClose = () => {
    reset();

    handleClose();
  };

  const onSuccess = () => {
    toast.success('Провайдер успешно добавлен');

    modalClose();
  };

  const onError = () => {
    toast.error('Не удалось добавить провайдера');

    handleClose();
  };

  const onSubmit = (data: AddModalFormData) => {
    createProvider(data, {
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
          name="url"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Адрес (url)"
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
      onClose={modalClose}
      title="Создание провайдера"
      footer={modalFooter}
      sx={{ width: '500px' }}
    />
  );
};
