import { FC } from 'react';

import { Tooltip } from '@mui/material';

import { LinkText, MenuLink } from './menu-item.styled';
import { MenuItemProps } from './menu-item.types';

export const MenuItem: FC<MenuItemProps> = ({ icon, isOpen, to, text }) => {
  return (
    <MenuLink to={to}>
      <Tooltip title={text}>{icon}</Tooltip>

      {isOpen && <LinkText>{text}</LinkText>}
    </MenuLink>
  );
};
