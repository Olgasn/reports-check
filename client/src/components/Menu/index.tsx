import { FC, useState } from 'react';
import { BtnClose, MenuStyled } from './styled';
import {
  faGear,
  faGraduationCap,
  faLayerGroup,
  faReply,
  faShare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LinkItem } from './LinkItem';

export const Menu: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <MenuStyled isOpen={isOpen}>
      <BtnClose onClick={toggleOpen}>
        <FontAwesomeIcon icon={isOpen ? faReply : faShare} />
      </BtnClose>
      <LinkItem to="/courses" icon={faGraduationCap} isOpen={isOpen} text="Курсы" />
      <LinkItem to="/groups" icon={faLayerGroup} isOpen={isOpen} text="Группы" />
      <LinkItem to="/settings" icon={faGear} isOpen={isOpen} text="Настройки" />
    </MenuStyled>
  );
};
