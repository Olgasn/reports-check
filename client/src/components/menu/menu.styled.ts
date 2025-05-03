import { COLORS } from '@constants';
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
