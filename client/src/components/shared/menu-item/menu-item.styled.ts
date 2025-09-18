import { COLORS, PARAMS } from '@constants';
import { darken } from 'polished';
import { NavLink } from 'react-router';
import styled from 'styled-components';

export const MenuLink = styled(NavLink)`
  color: ${darken(0.3, 'white')};
  text-decoration: none;
  font-size: ${PARAMS.LARGE_FONT_SIZE};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px;

  &:hover {
    cursor: pointer;
    color: white;
  }

  &.active {
    background-color: ${COLORS.SECONDARY};
    color: white;
  }
`;

export const LinkText = styled.div`
  font-family: ${PARAMS.DEFAULT_FONT};
  margin-left: ${PARAMS.MEDIUM_FONT_SIZE};
`;
