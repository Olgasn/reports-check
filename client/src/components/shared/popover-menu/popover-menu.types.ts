import { ReactElement } from 'react';

export interface Action {
  text: string;
  icon: ReactElement;
  cb: (id: number) => void;
}

export interface PopoverMenuProps {
  actions: Action[];
  elemId: number;
}
