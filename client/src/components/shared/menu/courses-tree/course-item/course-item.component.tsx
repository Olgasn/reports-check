import { FC } from 'react';

import { Box } from '@mui/material';

import { Link } from '../course-tree.styled';
import { LabItem } from '../lab-item';

import { CourseItemProps } from './course-item.types';

export const CourseItem: FC<CourseItemProps> = ({ id, name, labs }) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Link to={`/courses/${id}`}>{name}</Link>

      <Box display="flex" flexDirection="column" sx={{ mt: 1 }} gap={1}>
        {labs.map(({ id: labId, name: labName }) => (
          <LabItem id={labId} name={labName} key={labId} />
        ))}
      </Box>
    </Box>
  );
};
