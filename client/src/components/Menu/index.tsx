import { FC, useState } from 'react';
import { BtnClose, MenuStyled } from './styled';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { faFlaskVial, faGear, faReply, faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LinkItem } from './LinkItem';

export const Menu: FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <MenuStyled isOpen={isOpen}>
      <BtnClose onClick={toggleOpen}>
        <FontAwesomeIcon icon={isOpen ? faReply : faShare} />
      </BtnClose>
      <LinkItem to="/check" icon={faCircleCheck} isOpen={isOpen} text="Проверка" />
      <LinkItem to="/settings" icon={faGear} isOpen={isOpen} text="Настройки" />
      <LinkItem to="/tests" icon={faFlaskVial} isOpen={isOpen} text="Тесты" />
    </MenuStyled>
  );
};
