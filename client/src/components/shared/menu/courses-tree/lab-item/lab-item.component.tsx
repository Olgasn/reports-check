import { FC } from 'react';

import { Box } from '@mui/material';

import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';

import { Link, Text } from '../course-tree.styled';

import { LabItemProps } from './lab-item.types';

export const LabItem: FC<LabItemProps> = ({ id, name }) => {
  return (
    <Box display="flex" flexDirection="column">
      <Text>{name}</Text>

      <Box display="flex" flexDirection="column" sx={{ mt: 1 }} gap={1} alignItems="center">
        <Link to={`/labs/${id}/check`}>
          <Box display="flex" flexDirection="row" alignItems="center">
            <div>Проверка</div>
            <TaskOutlinedIcon />
          </Box>
        </Link>
        <Link to={`/labs/${id}/checks`}>
          <Box display="flex" flexDirection="row" alignItems="center">
            <div>Результаты</div>
            <AssessmentOutlinedIcon />
          </Box>
        </Link>
      </Box>
    </Box>
  );
};
