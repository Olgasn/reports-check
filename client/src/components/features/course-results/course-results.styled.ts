import { COLORS, PARAMS } from '@constants';
import { NavLink } from 'react-router';
import styled from 'styled-components';

export const LabLink = styled(NavLink)`
  text-decoration: none;
  color: ${COLORS.TEXT};
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
  font-family: ${PARAMS.DEFAULT_FONT};
  font-weight: bold;
  transition: all 0.2s ease-in;

  &:hover {
    color: ${COLORS.TEXT_LIGHTER};
    cursor: pointer;
  }
`;
