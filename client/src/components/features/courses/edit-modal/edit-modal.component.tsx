import { FC, useRef } from 'react';

import { Box, TextField, Button } from '@mui/material';

import { useUpdateCourse } from '@api';
import { COLORS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@shared';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { EditModalProps } from './edit-modal.types';
import { EditModalFormData, EditModalSchema } from './edit-modal.validation';

export const EditCourseModal: FC<EditModalProps> = ({ isShow, handleClose, item }) => {
  const onSuccess = () => {
    toast.success('Курс успешно обновлен');

    handleClose();
  };

  const onError = () => {
    toast.error('Не удалось обновить курс');

    handleClose();
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  const { mutate: updateCourse } = useUpdateCourse();

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(EditModalSchema),
    defaultValues: {
      name: item.name,
      description: item.description,
    },
  });

  const onSubmit = (data: EditModalFormData) => {
    updateCourse(
      { id: item.id, data },
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
      <Box display="flex" flexDirection="column">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Название курса"
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
              label="Описание курса"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              multiline={true}
              rows={4}
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
        Сохранить
      </Button>
    </Box>
  );

  return (
    <Modal
      body={modalBody}
      open={isShow}
      onClose={handleClose}
      title="Редактирование курса"
      footer={modalFooter}
      sx={{ width: '500px' }}
    />
  );
};
