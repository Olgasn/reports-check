import { ILab } from '@@types';
import { AppDispatch, getOneLab, RootState } from '@store';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { LabCheck } from '@components/LabCheck';

export const WithLab: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const {
    labFound,
    findOneLabThunk,
    labs: labsList,
  } = useSelector((state: RootState) => state.labs);
  const labId = Number(id);

  if (isNaN(labId)) {
    return null;
  }

  let lab: ILab | undefined = undefined;

  for (const labs of labsList) {
    const found = labs.labs.find((l) => l.id === labId);

    if (found) {
      lab = found;

      break;
    }
  }

  if (!lab && findOneLabThunk.status === 'idle') {
    dispatch(getOneLab(labId));
  }

  if (findOneLabThunk.status === 'rejected') {
    return null;
  }

  const l = lab || labFound;

  if (!l) {
    return null;
  }

  return <LabCheck lab={l} />;
};
