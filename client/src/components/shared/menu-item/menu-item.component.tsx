import { FC } from 'react';

import { Box, Tooltip } from '@mui/material';

import { LinkText, MenuLink } from './menu-item.styled';
import { MenuItemProps } from './menu-item.types';

export const MenuItem: FC<MenuItemProps> = ({ icon, isOpen, to, text }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <MenuLink to={to}>
        <Tooltip title={text}>{icon}</Tooltip>

        {isOpen && <LinkText>{text}</LinkText>}
      </MenuLink>
    </Box>
  );
};
