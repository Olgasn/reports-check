import { AppDispatch, getGroups, getGroupStudents, RootState } from '@store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useGroups = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { groups, getGroupsThunk } = useSelector((state: RootState) => state.groups);

  if (getGroupsThunk.status === 'idle') {
    dispatch(getGroups());
  }

  return groups;
};

export const useGroupStudents = (groupId: number) => {
  const dispatch = useDispatch<AppDispatch>();
  const { groupStudents, getGroupStudentsThunk } = useSelector(
    (state: RootState) => state.students
  );

  const group = groupStudents.find((gs) => gs.groupId === groupId);

  useEffect(() => {
    if (!group) {
      dispatch(getGroupStudents(groupId));
    }
  }, [groupId, group]);

  return group?.students || [];
};
