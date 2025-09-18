import { Box } from '@mui/material';
import styled from 'styled-components';

export const LabTaskBox = styled(Box)`
  background-color: white;
  padding: 20px 25px;
  border-radius: 10px;

  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);

  &:not(:first-child) {
    margin-top: 10px;
  }
`;
