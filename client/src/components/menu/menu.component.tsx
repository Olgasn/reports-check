import { FC, useState } from 'react';
import { IconButton } from '@mui/material';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import { MenuItem } from '@components';
import { MenuStyled } from './menu.styled';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { darken } from 'polished';

export const Menu: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <MenuStyled isOpen={isOpen}>
      <IconButton
        onClick={toggleOpen}
        sx={{
          color: darken(0.3, 'white'),
          width: '60px',
          height: '60px',
        }}
      >
        {isOpen ? <RedoOutlinedIcon /> : <UndoOutlinedIcon />}
      </IconButton>

      <MenuItem to="/courses" icon={<SchoolOutlinedIcon />} isOpen={isOpen} text="Курсы" />
      <MenuItem to="/groups" icon={<PeopleAltOutlinedIcon />} isOpen={isOpen} text="Группы" />
      <MenuItem to="/settings" icon={<SettingsOutlinedIcon />} isOpen={isOpen} text="Настройки" />
    </MenuStyled>
  );
};
