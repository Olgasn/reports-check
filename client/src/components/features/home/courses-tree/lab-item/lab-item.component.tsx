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

      <Box display="flex" flexDirection="column" sx={{ ml: 3, mt: 1 }} gap={1}>
        <Link to={`/labs/${id}/check`}>
          <Box display="flex" flexDirection="row" alignItems="center">
            <div>Проверка</div>
            <TaskOutlinedIcon sx={{ ml: 1 }} />
          </Box>
        </Link>
        <Link to={`/labs/${id}/checks`}>
          <Box display="flex" flexDirection="row" alignItems="center">
            <div>Результаты</div>
            <AssessmentOutlinedIcon sx={{ ml: 1 }} />
          </Box>
        </Link>
      </Box>
    </Box>
  );
};
