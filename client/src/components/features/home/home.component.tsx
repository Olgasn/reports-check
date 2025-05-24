import { FC } from 'react';

import { Box, Divider } from '@mui/material';

import { useAllCourses } from '@api';
import { TopHeader } from '@shared';

import { CoursesTree } from './courses-tree';

export const Home: FC = () => {
  const { data: courses } = useAllCourses();

  if (!courses) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <TopHeader
        text="Главная страница"
        subText="Здесь вы можете быстро перемещаться между курсами и лабораторными работами."
      />

      <Divider sx={{ my: 2 }} flexItem />

      <CoursesTree courses={courses} />
    </Box>
  );
};
