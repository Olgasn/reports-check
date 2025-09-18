import { FC, useId, useState, MouseEvent } from 'react';
import { PopoverMenuProps } from './popover-menu.types';
import { Box, IconButton, Popover } from '@mui/material';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import { COLORS } from '@constants';
import { PopoverBtn, PopoverText } from './popover-menu.styled';

export const PopoverMenu: FC<PopoverMenuProps> = ({ actions, elemId }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const itemId = useId();

  return (
    <div>
      <IconButton aria-describedby={itemId} onClick={handleClick}>
        <MoreVertOutlinedIcon fontSize="small" />
      </IconButton>

      <Popover
        id={itemId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box display="flex" flexDirection="column" justifyContent="start">
          {actions.map(({ text, icon, cb }, index) => (
            <PopoverBtn
              key={index}
              onClick={() => cb(elemId)}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'start',
                color: COLORS.TEXT,
                alignItems: 'center',
              }}
            >
              {icon}
              <PopoverText>{text}</PopoverText>
            </PopoverBtn>
          ))}
        </Box>
      </Popover>
    </div>
  );
};
