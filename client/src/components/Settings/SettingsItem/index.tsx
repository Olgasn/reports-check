import { FC, JSX } from 'react';
import {
  AddItemBtn,
  HeaderText,
  SettingsChildren,
  SettingsItemDiv,
  SettingsTextDiv,
  SubText,
} from './styled';

interface Props {
  text: string;
  subText: string;
  children: JSX.Element;
  addCb: () => void;
}

export const SettingsItem: FC<Props> = ({ text, subText, children, addCb }) => {
  return (
    <SettingsItemDiv>
      <SettingsTextDiv>
        <HeaderText>{text}</HeaderText>
        <SubText>{subText}</SubText>
      </SettingsTextDiv>

      <SettingsChildren>{children}</SettingsChildren>

      <AddItemBtn onClick={addCb}>Добавить</AddItemBtn>
    </SettingsItemDiv>
  );
};
