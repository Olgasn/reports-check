import { FC, useEffect, useRef } from 'react';

import { Box, Button, TextField } from '@mui/material';

import { useUpdateStudent } from '@api';
import { COLORS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@shared';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { EditStudentModalProps } from './edit-student-modal.types';
import { EditStudentFormData, EditStudentSchema } from './edit-student-modal.validation';

export const EditStudentModal: FC<EditStudentModalProps> = ({ isOpen, onClose, groupId, item }) => {
  const onSuccess = () => {
    toast.success('Студент успешно обновлен');

    onClose();
  };

  const onError = () => {
    toast.error('Не удалось обновить студента');

    onClose();
  };

  const formRef = useRef<HTMLFormElement | null>(null);
  const { mutate: updateStudent } = useUpdateStudent();

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(EditStudentSchema),
    defaultValues: {
      name: item.name,
      surname: item.surname,
      middlename: item.middlename,
    },
  });

  useEffect(() => {
    setValue('name', item.name);
    setValue('surname', item.surname);
    setValue('middlename', item.middlename);
  }, [item]);

  const onSubmit = (data: EditStudentFormData) => {
    updateStudent(
      { id: item.id, data: { groupId, ...data } },
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
        Сохранить
      </Button>
    </Box>
  );

  return (
    <Modal
      body={modalBody}
      open={isOpen}
      onClose={onClose}
      title="Обновление студента"
      footer={modalFooter}
      sx={{ width: '500px' }}
    />
  );
};
