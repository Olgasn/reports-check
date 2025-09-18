import { FC, useRef, useState } from 'react';

import { Box, TextField, Button } from '@mui/material';

import { useUpdateLab } from '@api';
import { COLORS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { FileSelect, Modal } from '@shared';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import { EditLabModalProps } from './edit-lab-modal.types';
import { EditLabFormData, EditLabSchema } from './edit-lab-modal.validation';

export const EditLabModal: FC<EditLabModalProps> = ({ isOpen, onClose, item }) => {
  const [file, setFile] = useState<File | null>(null);

  const onSuccess = () => {
    toast.success('Лабораторная успешно обновлена');

    onClose();
  };

  const onError = () => {
    toast.error('Не удалось обновить лабораторную');

    onClose();
  };

  const { mutate: updateLab } = useUpdateLab();
  const formRef = useRef<HTMLFormElement | null>(null);

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(EditLabSchema),
    defaultValues: {
      name: item.name,
      description: item.description,
    },
  });

  const onSubmit = (data: EditLabFormData) => {
    const reqData = {
      id: item.id,
      data: { ...data, task: file || undefined },
    };

    updateLab(reqData, {
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
        Сохранить
      </Button>
    </Box>
  );

  return (
    <Modal
      body={modalBody}
      open={isOpen}
      onClose={onClose}
      title="Редактирование лабораторной"
      footer={modalFooter}
      sx={{ width: '500px' }}
    />
  );
};
