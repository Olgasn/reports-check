import { Action } from '@shared';

interface Data {
  id: number;
  name: string;
  value: string;
}

export interface SettingsSectionProps {
  text: string;
  subText: string;
  data: Data[];
  actions: Action[];
  addCb: () => void;
}
