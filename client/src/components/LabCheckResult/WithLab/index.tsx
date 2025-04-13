import { FC } from 'react';
import { LabCheckResult } from '..';
import { useLab } from '@hooks';

export const WithLab: FC = () => {
  const lab = useLab();

  if (!lab) {
    return null;
  }

  return <LabCheckResult lab={lab} />;
};
