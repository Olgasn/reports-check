import { COLORS } from '@constants';
import roboto from '@fonts/Roboto-Regular.ttf';
import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyled = createGlobalStyle`
    @font-face {
        font-family: 'Roboto';
        font-weight: normal;
        font-style: normal;
        font-display: swap;
        src: url(${roboto});
    }

    html, body {
        background-color: ${COLORS.BG};
    }
`;

export const RootDiv = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const MainDiv = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
`;

export const ContainerDiv = styled.div`
  width: 100%;
  padding: 10px 20px;
`;
