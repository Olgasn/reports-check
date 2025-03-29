import { FC, JSX } from 'react';
import { HeaderText, SettingsChildren, SettingsItemDiv, SettingsTextDiv, SubText } from './styled';

interface Props {
  text: string;
  subText: string;
  children: JSX.Element;
}

export const SettingsItem: FC<Props> = ({ text, subText, children }) => {
  return (
    <SettingsItemDiv>
      <SettingsTextDiv>
        <HeaderText>{text}</HeaderText>
        <SubText>{subText}</SubText>
      </SettingsTextDiv>

      <SettingsChildren>{children}</SettingsChildren>
    </SettingsItemDiv>
  );
};
