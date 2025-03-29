import { COLORS } from '@constants';
import { NavLink } from 'react-router';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { darken } from 'polished';

interface MenuProps {
  isOpen: boolean;
}

export const MenuStyled = styled.aside<MenuProps>`
  ${({ isOpen }) => css`
    background-color: ${COLORS.MENU_BG};
    display: flex;
    flex-direction: column;
    padding: 20px 0px;
    width: ${isOpen ? '330px' : '60px'};
    align-items: center;
    transition: all 0.2s ease;
  `}
`;

interface LinkProps {
  isOpen: boolean;
}

export const MenuLink = styled(NavLink)<LinkProps>`
  ${({ isOpen }) => css`
    color: ${darken(0.3, 'white')};
    text-decoration: none;
    font-size: 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: ${isOpen ? '15px' : '25px'};

    &:hover {
      cursor: pointer;
      color: white;
    }

    &.active {
      color: white;
    }
  `}
`;

export const LinkText = styled.div`
  font-family: 'Roboto';
  margin-left: 15px;
`;

export const LinkIcon = styled(FontAwesomeIcon)``;

export const BtnClose = styled.div`
  font-family: 'Roboto';
  font-size: 20px;
  color: white;

  &:hover {
    cursor: pointer;
  }
`;
