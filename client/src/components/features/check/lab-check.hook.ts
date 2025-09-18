import { RootState } from '@store';
import { useSelector } from 'react-redux';

export const useLabCheckData = (labId: number) => {
  const { checkNotifications, checkStatus } = useSelector(
    (state: RootState) => state.notifications
  );

  const nots = checkNotifications[labId] ?? [];
  const status = checkStatus[labId] ?? 'pending';

  return { notifications: nots, status };
};
