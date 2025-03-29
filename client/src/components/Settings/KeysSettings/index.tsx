import { SettingsItem } from '@components/SettingsItem';
import { KEYS } from '@constants';
import { FC } from 'react';

export const KeysSettings: FC = () => {
  return (
    <SettingsItem text={'Ключи API'} subText={'Задайте здесь ключи для API.'}>
      <>
        {KEYS.KEYS.map((key) => (
          <div>{key}</div>
        ))}
      </>
    </SettingsItem>
  );
};
