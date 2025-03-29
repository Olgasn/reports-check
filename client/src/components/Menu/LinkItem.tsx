import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { FC } from 'react';
import { MenuLink, LinkIcon, LinkText } from './styled';

interface Props {
  icon: IconDefinition;
  isOpen: boolean;
  to: string;
  text: string;
}

export const LinkItem: FC<Props> = ({ icon, isOpen, to, text }) => {
  return (
    <MenuLink to={to} isOpen={isOpen}>
      <LinkIcon icon={icon} />
      {isOpen && <LinkText>{text}</LinkText>}
    </MenuLink>
  );
};
