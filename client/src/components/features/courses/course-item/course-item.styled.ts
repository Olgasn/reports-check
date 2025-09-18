import { Box } from '@mui/material';

import { COLORS, PARAMS } from '@constants';
import { lighten } from 'polished';
import { NavLink } from 'react-router';
import styled from 'styled-components';

export const CourseLink = styled(NavLink)`
  font-weight: bold;
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ${PARAMS.DEFAULT_FONT};
  color: ${COLORS.TEXT};
  text-decoration: none;
  transition: color 0.5s ease;

  &:hover {
    color: ${lighten(0.3, COLORS.TEXT)};
  }
`;

export const CourseDescription = styled.div`
  font-family: ${PARAMS.DEFAULT_FONT};
  color: ${COLORS.TEXT_LIGHTER};
  font-size: ${PARAMS.SMALL_FONT_SIZE};
  margin-top: 10px;
`;

export const CourseItemBox = styled(Box)`
  width: 350px;
  height: 200px;
  background-color: white;
  padding: 20px 25px;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:not(:first-child) {
    margin-left: 15px;
  }

  &:hover {
    transform: translateY(-12px);
    cursor: pointer;
  }
`;
