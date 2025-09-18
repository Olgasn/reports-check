import { FC } from 'react';
import { HeaderText, SubText } from './top-header.styled';
import { TopHeaderProps } from './top-header.types';

export const TopHeader: FC<TopHeaderProps> = ({ text, subText }) => {
  return (
    <div>
      <HeaderText>{text}</HeaderText>
      <SubText>{subText}</SubText>
    </div>
  );
};
