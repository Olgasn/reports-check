import { FC, useMemo } from 'react';

import { Box } from '@mui/material';

import { useDeleteStudent } from '@api';
import { Avatar, getDefaultActions, PopoverMenu } from '@shared';
import { toast } from 'react-toastify';

import { StudentItemProps } from './student-item.types';

export const StudentItem: FC<StudentItemProps> = ({ item, editCb }) => {
  const onSuccess = () => toast.success('Студент успешно удален');
  const onError = () => toast.error('Не удалось удалить студента');

  const { mutate: deleteStudent } = useDeleteStudent();

  const studentStr = `${item.name} ${item.surname} ${item.middlename}`;

  const actions = useMemo(
    () =>
      getDefaultActions(editCb, () => {
        const confirmed = window.confirm('Вы действительно хотите удалить студента?');

        if (!confirmed) {
          return;
        }

        deleteStudent(item.id, {
          onError,
          onSuccess,
        });
      }),
    []
  );

  return (
    <Box display="flex" flexDirection="row" justifyContent="space-between">
      <Avatar text={studentStr} />

      <PopoverMenu actions={actions} elemId={-1} />
    </Box>
  );
};
