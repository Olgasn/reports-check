import { FC, useMemo } from 'react';

import { Box } from '@mui/material';

import { formatFileSize, getFileIcon } from '@utils';

import { LabTaskText } from './lab-task.styled';
import { LabTaskProps } from './lab-task.types';

export const LabTask: FC<LabTaskProps> = ({ filename, filesize, sx }) => {
  const [icon, size] = useMemo(
    () => [getFileIcon(filename), formatFileSize(filesize)],
    [filename, filesize]
  );

  return (
    <Box display="flex" flexDirection="row" alignItems="center" sx={sx}>
      {icon}

      <LabTaskText>{filename}</LabTaskText>

      <LabTaskText>{size}</LabTaskText>
    </Box>
  );
};
