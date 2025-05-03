import { useCourses } from '@api';
import { TopHeader } from '@components';
import { Box, Button, Divider } from '@mui/material';
import { split } from '@utils';
import { FC, useMemo } from 'react';
import { CourseItem } from './course-item';
import { COLORS } from '@constants';
import { useModalControls } from '@hooks';
import { AddModal } from './add-modal';

export const Courses: FC = () => {
  const addModalControls = useModalControls();

  const { data: courses, isLoading } = useCourses();

  const coursesSplitted = useMemo(() => split(courses ?? [], 3), [courses]);

  const handleOpenAddModal = () => {
    addModalControls.handleOpen();
  };

  if (isLoading) {
    return null;
  }

  return (
    <Box>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <TopHeader text="Курсы" subText="Здесь вы можете создавать и редактировать курсы." />

        <Button
          variant="contained"
          sx={{
            height: '40px',
            textTransform: 'unset',
            background: COLORS.SECONDARY,
          }}
          onClick={handleOpenAddModal}
        >
          Добавить
        </Button>
      </Box>

      <Divider flexItem sx={{ my: 2 }} />

      <Box display="flex" flexDirection="column">
        {coursesSplitted.map((line, index) => (
          <Box key={index} display="flex" flexDirection="row">
            {line.map(({ id, name, description }) => (
              <CourseItem key={id} name={name} description={description} id={id} />
            ))}
          </Box>
        ))}
      </Box>

      <AddModal handleClose={addModalControls.handleClose} isShow={addModalControls.open} />
    </Box>
  );
};
