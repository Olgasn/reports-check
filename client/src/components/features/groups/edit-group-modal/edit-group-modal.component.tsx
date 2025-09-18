import { FC, useEffect, useRef } from 'react';

import { Box, TextField, Button } from '@mui/material';

import { useUpdateGroup } from '@api';
import { COLORS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@shared';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import { EditGroupModalProps } from './edit-group-modal.types';
import { EditGroupFormData, EditGroupSchema } from './edit-group-modal.validation';

export const EditGroupModal: FC<EditGroupModalProps> = ({ isShow, handleClose, item }) => {
  const onSuccess = () => {
    toast.success('Группа успешно обновлена');

    handleClose();
  };

  const onError = () => {
    toast.error('Не удалось обновить группу');

    handleClose();
  };

  const formRef = useRef<HTMLFormElement | null>(null);
  const { mutate: updateGroup } = useUpdateGroup();

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(EditGroupSchema),
    defaultValues: {
      name: item.name,
    },
  });

  useEffect(() => {
    setValue('name', item.name);
  }, [item]);

  const onSubmit = (data: EditGroupFormData) => {
    updateGroup(
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
        Сохранить
      </Button>
    </Box>
  );

  return (
    <Modal
      body={modalBody}
      open={isShow}
      onClose={handleClose}
      title="Обновление группы"
      footer={modalFooter}
      sx={{ width: '500px' }}
    />
  );
};
