import { FC } from 'react';
import { AvatarProps } from './avatar.types';
import { Avatar as AvatarMui, Box } from '@mui/material';
import { stringAvatar } from '@utils';
import { AvatarText } from './avatar.styled';

export const Avatar: FC<AvatarProps> = ({ text, sx, size = 40 }) => {
  return (
    <Box sx={sx} display="flex" flexDirection="row" alignItems="center">
      <AvatarMui {...stringAvatar(text, { width: size, height: size })} />
      <AvatarText>{text}</AvatarText>
    </Box>
  );
};
