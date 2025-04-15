import { useGroups, useLab } from '@hooks';
import { FC } from 'react';
import { LabCheck } from '..';

export const WithLabCheck: FC = () => {
  const lab = useLab();
  const groups = useGroups();

  if (!lab || !groups.length) {
    return null;
  }

  return <LabCheck lab={lab} groups={groups} />;
};
