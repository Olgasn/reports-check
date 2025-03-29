import { COLORS } from '@constants';
import styled from 'styled-components';

export const KeyItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const KeyName = styled.div`
  font-family: 'Roboto';
  color: ${COLORS.TEXT};
  font-size: 16px;
  width: 200px;
  text-align: right;
  margin-right: 20px;
`;

export const KeyValue = styled.div`
  font-family: 'Roboto';
  color: ${COLORS.TEXT_LIGHTER};
  font-size: 16px;
  width: 400px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
