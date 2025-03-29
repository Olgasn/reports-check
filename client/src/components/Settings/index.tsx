import { TopHeader } from '@components/TopHeader';
import { FC } from 'react';
import { KeysSettings } from './KeysSettings';
import { ModelsSettings } from './ModelsSettings';

export const Settings: FC = () => {
  return (
    <div>
      <TopHeader text="Настройки" subText="Вы можете изменить настройки здесь." />

      <hr />

      <KeysSettings />

      <hr />

      <ModelsSettings />

      <hr />
    </div>
  );
};
