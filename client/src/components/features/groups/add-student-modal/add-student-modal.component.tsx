import { FC, useRef } from 'react';

import { Box, Button, TextField } from '@mui/material';

import { useCreateStudent } from '@api';
import { COLORS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@shared';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { AddStudentModalProps } from './add-student-modal.types';
import { AddStudentFormData, AddStudentSchema } from './add-student-modal.validation';

export const AddStudentModal: FC<AddStudentModalProps> = ({ isOpen, onClose, groupId }) => {
  const onSuccess = () => {
    toast.success('Студент успешно добавлен');

    onClose();
  };

  const onError = () => {
    toast.error('Не удалось добавить студента');

    onClose();
  };

  const formRef = useRef<HTMLFormElement | null>(null);
  const { mutate: createStudent } = useCreateStudent();

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(AddStudentSchema),
  });

  const onSubmit = (data: AddStudentFormData) => {
    createStudent(
      { groupId, ...data },
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

  const modalBody = (
    <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Имя"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              size="small"
            />
          )}
        />

        <Controller
          name="surname"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Фамилия"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              size="small"
            />
          )}
        />

        <Controller
          name="middlename"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Отчество"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
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
      open={isOpen}
      onClose={onClose}
      title="Создание студента"
      footer={modalFooter}
      sx={{ width: '500px' }}
    />
  );
};
