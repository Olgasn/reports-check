import { PARAMS } from '@constants';
import { darken } from 'polished';
import { NavLink } from 'react-router';
import styled from 'styled-components';

export const Text = styled.div`
  font-family: ${PARAMS.DEFAULT_FONT};
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
  color: ${darken(0.5, 'white')};
`;

export const Link = styled(NavLink)`
  font-family: ${PARAMS.DEFAULT_FONT};
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
  color: ${darken(0.5, 'white')};
  transition: color 0.5s ease;
  text-decoration: none;

  &:hover {
    cursor: pointer;
    color: white;
  }

  &.active {
    color: white;
    font-weight: bold;
  }
`;
