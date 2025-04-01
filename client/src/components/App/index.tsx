import { FC, useEffect } from 'react';
import { ContainerDiv, GlobalStyled, MainDiv, RootDiv } from './styled';
import { Outlet } from 'react-router-dom';
import { Menu } from '@components/Menu';
import { useDispatch } from 'react-redux';
import { AppDispatch, getKeys, getModels } from '@store';

export const App: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getKeys());
    dispatch(getModels());
  }, []);

  return (
    <RootDiv>
      <MainDiv>
        <Menu />

        <ContainerDiv>
          <Outlet />
        </ContainerDiv>
      </MainDiv>

      <GlobalStyled />
    </RootDiv>
  );
};
