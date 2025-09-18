import { FC, useMemo } from 'react';

import { Box, Divider } from '@mui/material';

import { useDeleteLab } from '@api';
import { useModalControls } from '@hooks';
import { LabTask, PopoverMenu, TaskModal } from '@shared';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

import { EditLabModal } from './edit-lab-modal';
import { getLabActions } from './lab.constants';
import { LabDesc, LabDiv, LabHeaderText } from './lab.styled';
import { LabProps } from './lab.types';

export const Lab: FC<LabProps> = ({ item }) => {
  const deleteSuccess = () => toast.success('Лабораторная успешно удалена');
  const deleteError = () => toast.error('Не удалось удалить лабораторную');

  const navigate = useNavigate();

  const { mutate: deleteLab } = useDeleteLab();

  const taskModalControls = useModalControls();
  const editControls = useModalControls();

  const actions = useMemo(
    () =>
      getLabActions({
        checkCb: () => {
          navigate(`/labs/${item.id}/check`);
        },
        deleteCb: () => {
          const confirmed = window.confirm('Вы действительно хотите удалить элемент?');

          if (!confirmed) {
            return;
          }

          deleteLab(item.id, {
            onSuccess: deleteSuccess,
            onError: deleteError,
          });
        },
        editCb: () => {
          editControls.handleOpen();
        },
        resultCb: () => {
          navigate(`/labs/${item.id}/checks`);
        },
        openCb: () => {
          taskModalControls.handleOpen();
        },
      }),
    [item]
  );

  return (
    <LabDiv>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <LabHeaderText>{item.name}</LabHeaderText>

        <PopoverMenu actions={actions} elemId={item.id} />
      </Box>

      <Divider flexItem sx={{ my: 2 }} />

      <LabDesc>{item.description}</LabDesc>

      <LabTask filename={item.filename} filesize={item.filesize} sx={{ mt: 2 }} />

      <TaskModal
        title={item.name}
        task={item.content}
        isOpen={taskModalControls.open}
        onClose={taskModalControls.handleClose}
      />

      <EditLabModal item={item} isOpen={editControls.open} onClose={editControls.handleClose} />
    </LabDiv>
  );
};
