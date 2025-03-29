import { TopHeader } from '@components/TopHeader';
import { FC } from 'react';
import { KeysSettings } from './KeysSettings';

export const Settings: FC = () => {
  return (
    <div>
      <TopHeader text="Настройки" subText="Вы можете изменить настройки здесь." />

      <hr />

      <KeysSettings />

      <hr />
    </div>
  );
};
