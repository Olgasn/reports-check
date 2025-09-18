import { COLORS, PARAMS } from '@constants';
import styled from 'styled-components';

export const KeyItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const KeyName = styled.div`
  font-family: ${PARAMS.DEFAULT_FONT};
  color: ${COLORS.TEXT};
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
  width: 200px;
  text-align: right;
  margin-right: 20px;
`;

export const KeyValue = styled.div`
  font-family: ${PARAMS.DEFAULT_FONT};
  color: ${COLORS.TEXT_LIGHTER};
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
  width: 400px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
