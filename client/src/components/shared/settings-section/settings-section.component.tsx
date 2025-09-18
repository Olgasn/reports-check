import { Tooltip } from '@mui/material';
import { FC } from 'react';
import { KeyItem, KeyName, KeyValue } from './settings-section.styled';
import { SettingsSectionProps } from './settings-section.types';
import { PopoverMenu, SettingsItem } from '@shared';

export const SettingsSection: FC<SettingsSectionProps> = ({
  text,
  subText,
  data,
  actions,
  addCb,
}) => {
  return (
    <SettingsItem text={text} subText={subText} addCb={addCb}>
      <>
        {data.map(({ id, name, value }) => (
          <KeyItem key={id}>
            <KeyName>{name}</KeyName>

            <Tooltip title={value}>
              <KeyValue>{value}</KeyValue>
            </Tooltip>

            <PopoverMenu actions={actions} elemId={id} />
          </KeyItem>
        ))}
      </>
    </SettingsItem>
  );
};
