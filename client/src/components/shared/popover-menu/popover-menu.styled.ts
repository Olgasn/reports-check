import { COLORS, PARAMS } from '@constants';
import { Button } from '@mui/material';
import styled from 'styled-components';

export const PopoverText = styled.div`
  color: ${COLORS.TEXT};
  font-size: ${PARAMS.SMALL_FONT_SIZE};
  font-family: ${PARAMS.DEFAULT_FONT};
  text-transform: none !important;
  margin-left: 5px;
  margin-top: 2px;
`;

export const PopoverBtn = styled(Button)`
  & > svg {
    font-size: ${PARAMS.LARGE_FONT_SIZE};
  }
`;
