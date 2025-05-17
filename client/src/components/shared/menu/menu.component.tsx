import { FC, useState } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import { MenuStyled, NotificationsBtn } from './menu.styled';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { darken } from 'polished';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useModalControls } from '@hooks';
import { MenuItem, NotificationsModal, useNotifications } from '@shared';

export const Menu: FC = () => {
  const notificationControls = useModalControls();

  const [isOpen, setIsOpen] = useState(false);
  const notifications = useNotifications();

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationsOpen = () => {
    notificationControls.handleOpen();
  };

  const handleNotificationsClose = () => {
    notificationControls.handleClose();
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

      <NotificationsBtn onClick={handleNotificationsOpen}>
        <Tooltip title="Уведомления">
          <Badge badgeContent={notifications.length} color="primary" sx={{ height: '20px' }}>
            <NotificationsOutlinedIcon />
          </Badge>
        </Tooltip>
      </NotificationsBtn>

      <NotificationsModal
        isOpen={notificationControls.open}
        handleClose={handleNotificationsClose}
      />
    </MenuStyled>
  );
};
