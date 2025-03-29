import { Tooltip } from '@mui/material';
import { FC } from 'react';
import { Action, Dropdowns } from '../Dropdowns';
import { SettingsItem } from '../SettingsItem';
import { KeyItem, KeyName, KeyValue } from './styled';

interface Data {
  id: number;
  name: string;
  value: string;
}

interface Props {
  text: string;
  subText: string;
  data: Data[];
  actions: Action[];
  addCb: () => void;
}

export const SettingsSection: FC<Props> = ({ text, subText, data, actions, addCb }) => {
  return (
    <SettingsItem text={text} subText={subText} addCb={addCb}>
      <>
        {data.map(({ id, name, value }) => (
          <KeyItem key={id}>
            <KeyName>{name}</KeyName>

            <Tooltip title={value}>
              <KeyValue>{value}</KeyValue>
            </Tooltip>

            <Dropdowns actions={actions} itemId={id} />
          </KeyItem>
        ))}
      </>
    </SettingsItem>
  );
};
