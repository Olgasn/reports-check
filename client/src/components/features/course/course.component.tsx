import { FC, useMemo } from 'react';

import { Box, Button, Divider } from '@mui/material';

import { useCourse, useCourseLabs, useDeleteCourse } from '@api';
import { COLORS } from '@constants';
import { useModalControls } from '@hooks';
import { CourseCrumb, getDefaultActions, PopoverMenu, TopHeader } from '@shared';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';

import { EditCourseModal } from '../courses/edit-modal';

import { Lab } from './lab';
import { AddLabModal } from './lab/add-lab-modal';
import { Prompt } from './prompt';

export const Course: FC = () => {
  const editModalControls = useModalControls();
  const addLabControls = useModalControls();

  const deleteOnSuccess = () => toast.success('Курс успешно удален');
  const deleteOnError = () => toast.error('Не удалось удалить курс');

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const courseId = Number(id);

  const { data: labs } = useCourseLabs(courseId);
  const { data: course } = useCourse(courseId);
  const { mutate: deleteCourse } = useDeleteCourse();

  const handleAddLabModalOpen = () => {
    addLabControls.handleOpen();
  };

  const actions = useMemo(
    () =>
      getDefaultActions(
        () => {
          if (!course) {
            return;
          }

          editModalControls.handleOpen();
        },
        () => {
          if (!course) {
            return;
          }

          const confirmed = window.confirm('Вы действительно хотите удалить элемент?');

          if (!confirmed) {
            return;
          }

          deleteCourse(course.id, {
            onSuccess: () => {
              deleteOnSuccess();

              navigate('/courses');
            },
            onError: deleteOnError,
          });
        }
      ),
    [course]
  );

  if (!course || !labs) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <CourseCrumb courseName={course.name} />

      <Divider flexItem sx={{ my: 2 }} />

      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <TopHeader text={course.name} subText={course.description} />

        <PopoverMenu actions={actions} elemId={course.id} />
      </Box>

      <Divider flexItem sx={{ my: 2 }} />

      <Prompt prompt={course.prompt ?? undefined} courseId={course.id} />

      <Divider flexItem sx={{ my: 2 }} />

      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <TopHeader text="Лабораторные работы" subText="Список лабораторных работ" />

        <Button
          variant="contained"
          sx={{ background: COLORS.SECONDARY, textTransform: 'unset', height: '40px' }}
          onClick={handleAddLabModalOpen}
        >
          Добавить
        </Button>
      </Box>

      <Divider flexItem sx={{ my: 2 }} />

      <Box display="flex" flexDirection="column">
        {labs.map((lab) => (
          <Lab courseId={course.id} item={lab} />
        ))}
      </Box>

      <EditCourseModal
        item={course}
        handleClose={editModalControls.handleClose}
        isShow={editModalControls.open}
      />

      <AddLabModal
        isOpen={addLabControls.open}
        onClose={addLabControls.handleClose}
        courseId={course.id}
      />
    </Box>
  );
};
