import { ReactElement } from 'react';

export interface MenuItemProps {
  icon: ReactElement;
  isOpen: boolean;
  to: string;
  text: string;
}
