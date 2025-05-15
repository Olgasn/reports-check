import { KeysSettings, ModelsSettings, ProvidersSettings, TopHeader } from '@components';
import { Box, Divider } from '@mui/material';
import { FC } from 'react';

export const Settings: FC = () => {
  return (
    <Box>
      <TopHeader text="Настройки" subText="Вы можете изменить настройки здесь." />

      <Divider flexItem sx={{ my: 2 }} />

      <KeysSettings />

      <Divider flexItem sx={{ my: 2 }} />

      <ModelsSettings />

      <Divider flexItem sx={{ my: 2 }} />

      <ProvidersSettings />
    </Box>
  );
};
