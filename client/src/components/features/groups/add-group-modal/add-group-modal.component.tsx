import { FC, useRef } from 'react';

import { Box, TextField, Button } from '@mui/material';

import { useCreateGroup } from '@api';
import { COLORS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@shared';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import { AddGroupModalProps } from './add-group-modal.types';
import { AddGroupFormData, AddGroupSchema } from './add-group-modal.validation';

export const AddGroupModal: FC<AddGroupModalProps> = ({ isShow, handleClose }) => {
  const onSuccess = () => {
    toast.success('Группа успешно добавлена');

    handleClose();
  };

  const onError = () => {
    toast.error('Не удалось добавить группу');

    handleClose();
  };

  const formRef = useRef<HTMLFormElement | null>(null);
  const { mutate: createGroup } = useCreateGroup();

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(AddGroupSchema),
  });

  const onSubmit = (data: AddGroupFormData) => {
    createGroup(data, {
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
      title="Создание группы"
      footer={modalFooter}
      sx={{ width: '500px' }}
    />
  );
};
