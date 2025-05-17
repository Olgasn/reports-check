import { COLORS, PARAMS } from '@constants';
import { IconButton } from '@mui/material';
import { darken } from 'polished';
import styled, { css } from 'styled-components';

interface MenuProps {
  isOpen: boolean;
}

export const MenuStyled = styled.aside<MenuProps>`
  ${({ isOpen }) => css`
    background-color: ${COLORS.MENU_BG};
    display: flex;
    flex-direction: column;
    width: ${isOpen ? '330px' : '60px'};
    align-items: center;
    transition: all 0.2s ease;
    max-height: 100vh;
  `}
`;

export const NotificationsBtn = styled(IconButton)`
  font-family: ${PARAMS.DEFAULT_FONT};
  margin-left: ${PARAMS.MEDIUM_FONT_SIZE};
  height: 60px;
  color: ${darken(0.3, 'white')} !important;
`;
