import { FC } from 'react';

import { Box } from '@mui/material';

import { CourseItem } from './course-item';
import { CoursesTreeProps } from './courses-tree.types';

export const CoursesTree: FC<CoursesTreeProps> = ({ courses }) => {
  return (
    <Box display="flex" flexDirection="column">
      {courses.map((course) => (
        <CourseItem {...course} />
      ))}
    </Box>
  );
};
