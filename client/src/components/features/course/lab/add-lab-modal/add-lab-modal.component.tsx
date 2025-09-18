import { FC, useRef, useState } from 'react';

import { Box, TextField, Button } from '@mui/material';

import { useCreateLab } from '@api';
import { COLORS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { FileSelect, Modal } from '@shared';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import { AddLabModalProps } from './add-lab-modal.types';
import { AddLabFormData, AddLabSchema } from './add-lab-modal.validation';

export const AddLabModal: FC<AddLabModalProps> = ({ isOpen, onClose, courseId }) => {
  const [file, setFile] = useState<File | null>(null);

  const onSuccess = () => {
    toast.success('Лабораторная успешно добавлена');

    onClose();
  };

  const onError = () => {
    toast.error('Не удалось добавить лабораторную');

    onClose();
  };

  const { mutate: createLab } = useCreateLab();
  const formRef = useRef<HTMLFormElement | null>(null);

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(AddLabSchema),
  });

  const onSubmit = (data: AddLabFormData) => {
    if (!file) {
      window.alert('Вы не выбрали файл');

      return;
    }

    const reqData = {
      courseId,
      ...data,
      task: file,
    };

    createLab(reqData, {
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
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Описание"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={{
                mt: 2,
              }}
              size="small"
              multiline
              rows={3}
            />
          )}
        />

        <FileSelect onChange={setFile} sx={{ mt: 2 }} />
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
      open={isOpen}
      onClose={onClose}
      title="Добавление лабораторной"
      footer={modalFooter}
      sx={{ width: '500px' }}
    />
  );
};
