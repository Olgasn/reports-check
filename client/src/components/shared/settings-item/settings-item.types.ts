import { JSX } from 'react';

export interface SettingsItemProps {
  text: string;
  subText: string;
  children: JSX.Element;
  addCb: () => void;
}
