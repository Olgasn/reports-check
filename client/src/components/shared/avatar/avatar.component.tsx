import { FC } from 'react';

import { Avatar as AvatarMui, Box } from '@mui/material';

import { stringAvatar } from '@utils';

import { AvatarText } from './avatar.styled';
import { AvatarProps } from './avatar.types';

export const Avatar: FC<AvatarProps> = ({ text, sx, size = 40, additionalText = '' }) => {
  return (
    <Box sx={sx} display="flex" flexDirection="row" alignItems="center">
      <AvatarMui {...stringAvatar(text, { width: size, height: size })} />
      <AvatarText>
        {text} {additionalText}
      </AvatarText>
    </Box>
  );
};
