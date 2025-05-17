import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { RootDiv, MainDiv, ContainerDiv, GlobalStyled } from './app.styled';
import { ToastContainer } from 'react-toastify';
import { PARAMS } from '@constants';
import { Menu } from '@shared';

export const App: FC = () => {
  return (
    <RootDiv>
      <MainDiv>
        <Menu />

        <ContainerDiv>
          <Outlet />
        </ContainerDiv>
      </MainDiv>

      <GlobalStyled />

      <ToastContainer
        position="bottom-right"
        autoClose={PARAMS.TOAST_SHOW_TIME}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </RootDiv>
  );
};
