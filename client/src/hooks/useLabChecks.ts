import { AppDispatch, getLabChecks, RootState } from '@store';
import { useDispatch, useSelector } from 'react-redux';

export const useLabChecks = (labId: number) => {
  const dispatch = useDispatch<AppDispatch>();
  const { labChecks } = useSelector((state: RootState) => state.reports);

  const checks = labChecks.find((l) => l.labId === labId);

  if (!checks) {
    dispatch(getLabChecks(labId));

    return [];
  }

  return checks.results;
};
