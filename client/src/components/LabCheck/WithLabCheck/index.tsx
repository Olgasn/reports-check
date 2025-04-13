import { useLab } from '@hooks';
import { FC } from 'react';
import { LabCheck } from '..';

export const WithLabCheck: FC = () => {
  const lab = useLab();

  if (!lab) {
    return null;
  }

  return <LabCheck lab={lab} />;
};
