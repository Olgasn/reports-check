import { FC, useState } from 'react';

import { Badge, Box, Divider, IconButton, Tooltip } from '@mui/material';

import { useAllCourses } from '@api';
import { useModalControls } from '@hooks';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import { MenuItem, NotificationsModal } from '@shared';
import { RootState } from '@store';
import { darken } from 'polished';
import { useSelector } from 'react-redux';

import { CoursesTree } from './courses-tree';
import { MenuStyled, NotificationsBtn } from './menu.styled';

export const Menu: FC = () => {
  const notificationControls = useModalControls();

  const [isOpen, setIsOpen] = useState(true);
  const { notifications } = useSelector((state: RootState) => state.notifications);

  const { data: courses } = useAllCourses();

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationsOpen = () => {
    notificationControls.handleOpen();
  };

  const handleNotificationsClose = () => {
    notificationControls.handleClose();
  };

  if (!courses) {
    return null;
  }

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

      <MenuItem to="/home" icon={<HomeOutlinedIcon />} isOpen={isOpen} text="Главная" />

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

      {isOpen && <Divider flexItem sx={{ my: 2, bgcolor: 'white' }} />}

      <Box
        display="flex"
        flexDirection="column"
        sx={{ width: '100%', display: isOpen ? 'block' : 'none', mb: 2 }}
      >
        <CoursesTree courses={courses} />
      </Box>

      <NotificationsModal
        isOpen={notificationControls.open}
        handleClose={handleNotificationsClose}
      />
    </MenuStyled>
  );
};
