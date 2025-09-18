import { COLORS, PARAMS } from '@constants';
import { Box } from '@mui/material';
import styled from 'styled-components';

export const LabDiv = styled(Box)`
  background-color: white;
  padding: 20px 25px;
  border-radius: 10px;

  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);

  &:not(:first-child) {
    margin-top: 10px;
  }
`;

export const LabHeaderText = styled.div`
  font-family: ${PARAMS.DEFAULT_FONT};
  color: ${COLORS.TEXT};
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
  font-weight: bold;
`;

export const LabDesc = styled.div`
  font-family: ${PARAMS.DEFAULT_FONT};
  color: ${COLORS.TEXT_LIGHTER};
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
  margin-top: 5px;
`;
