import { Box, IconButton, Modal as MuiModal, Typography } from '@mui/material';
import { FC } from 'react';
import { MODAL_SX } from './modal.constants';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { ModalProps } from './modal.props';
import { COLORS, PARAMS } from '@constants';

export const Modal: FC<ModalProps> = ({ open, onClose, footer, body, sx, title }) => {
  const finalSx = sx ? { ...sx, ...MODAL_SX } : MODAL_SX;

  return (
    <MuiModal open={open} onClose={onClose}>
      <Box sx={finalSx} display="flex" flexDirection="column">
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3, height: '25px' }}
        >
          {title && (
            <Typography
              sx={{
                color: COLORS.TEXT,
                fontFamily: PARAMS.DEFAULT_FONT,
                fontSize: PARAMS.HEADING_FONT_SIZE,
              }}
            >
              {title}
            </Typography>
          )}

          <IconButton onClick={onClose}>
            <CloseOutlinedIcon />
          </IconButton>
        </Box>

        {body}

        {footer && <Box sx={{ mt: 2 }}>{footer}</Box>}
      </Box>
    </MuiModal>
  );
};
