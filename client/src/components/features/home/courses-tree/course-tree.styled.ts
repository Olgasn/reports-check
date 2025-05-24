import { COLORS, PARAMS } from '@constants';
import { NavLink } from 'react-router';
import styled from 'styled-components';

export const Text = styled.div`
  font-family: ${PARAMS.DEFAULT_FONT};
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
  color: ${COLORS.TEXT};
`;

export const Link = styled(NavLink)`
  font-family: ${PARAMS.DEFAULT_FONT};
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
  color: ${COLORS.TEXT};
  transition: color 0.5s ease;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    cursor: pointer;
    color: ${COLORS.TEXT_LIGHTER};
  }
`;
