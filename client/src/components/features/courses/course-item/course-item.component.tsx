import { FC, useMemo } from 'react';

import { Box, Tooltip } from '@mui/material';

import { useDeleteCourse } from '@api';
import { useModalControls } from '@hooks';
import { getDefaultActions, PopoverMenu } from '@shared';
import { toast } from 'react-toastify';

import { EditCourseModal } from '../edit-modal';

import { CourseDescription, CourseItemBox, CourseLink } from './course-item.styled';
import { CourseItemProps } from './course-item.types';

export const CourseItem: FC<CourseItemProps> = ({ id, name, description }) => {
  const editModalControls = useModalControls();

  const { mutate: deleteCourse } = useDeleteCourse();

  const onSuccess = () => toast.success('Курс успешно удален');
  const onError = () => toast.error('Не удалось удалить курс');

  const actions = useMemo(
    () =>
      getDefaultActions(
        () => editModalControls.handleOpen(),
        () => {
          const confirmed = window.confirm('Вы действительно хотите удалить элемент?');

          if (!confirmed) {
            return;
          }

          deleteCourse(id, {
            onSuccess,
            onError,
          });
        }
      ),
    []
  );

  return (
    <CourseItemBox display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Tooltip title={name}>
          <CourseLink to={`/courses/${id}`}>{name}</CourseLink>
        </Tooltip>

        <PopoverMenu actions={actions} elemId={id} />
      </Box>

      <CourseDescription>{description}</CourseDescription>

      <EditCourseModal
        isShow={editModalControls.open}
        handleClose={editModalControls.handleClose}
        item={{ id, name, description, prompt: null }}
      />
    </CourseItemBox>
  );
};
