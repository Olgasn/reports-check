import { FC } from 'react';

import { Box, Divider } from '@mui/material';

import { TopHeader } from '@shared';

import { KeysSettings } from './keys-settings';
import { ModelsSettings } from './models-settings';
import { ProvidersSettings } from './providers-settings';

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
