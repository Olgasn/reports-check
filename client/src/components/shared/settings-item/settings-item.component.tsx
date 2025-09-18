import { Box, Button } from '@mui/material';
import { SettingsItemProps } from './settings-item.types';
import { FC } from 'react';
import { COLORS } from '@constants';
import { TopHeader } from '@shared';

export const SettingsItem: FC<SettingsItemProps> = ({ text, subText, children, addCb }) => {
  return (
    <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
      <TopHeader text={text} subText={subText} />

      <Box display="flex" flexDirection="column" alignItems="center">
        {children}
      </Box>

      <Button
        onClick={addCb}
        variant="contained"
        sx={{ background: COLORS.SECONDARY, textTransform: 'unset' }}
      >
        Добавить
      </Button>
    </Box>
  );
};
