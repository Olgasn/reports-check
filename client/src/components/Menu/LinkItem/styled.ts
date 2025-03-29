import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { darken } from 'polished';
import { NavLink } from 'react-router';
import styled, { css } from 'styled-components';

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
