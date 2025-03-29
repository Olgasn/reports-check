import { FC } from 'react';
import { HeaderText, SubText } from './styled';

interface Props {
  text: string;
  subText: string;
}

export const TopHeader: FC<Props> = ({ text, subText }) => {
  return (
    <div>
      <HeaderText>{text}</HeaderText>
      <SubText>{subText}</SubText>
    </div>
  );
};
