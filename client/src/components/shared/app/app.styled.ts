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
        margin: 0;
        padding: 0;
        max-height: 100vh;
    }

    ::-webkit-scrollbar {
        background-color: #fff !important;
        width: 12px !important;
        background: none;
    }

    ::-webkit-scrollbar-track {
        background-color: #fff !important;
        background: none;
    }

    ::-webkit-scrollbar-thumb {
        background-color: ${COLORS.SECONDARY} !important;
        border-radius: 16px !important;
        border: 4px solid #fff !important;
        background: none;
    }

    ::-webkit-scrollbar-button {
        display:none !important;
        background-color: none;
    }
`;

export const RootDiv = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

export const MainDiv = styled.main`
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;

export const ContainerDiv = styled.div`
  width: 100%;
  padding: 10px 20px;
  overflow-y: auto;
`;
