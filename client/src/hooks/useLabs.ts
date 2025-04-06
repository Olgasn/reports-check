import { AppDispatch, getCourseLabs, RootState } from '@store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useLabs = (courseId: number) => {
  const dispatch = useDispatch<AppDispatch>();
  const { labs, getCourseLabsThunk } = useSelector((state: RootState) => state.labs);

  useEffect(() => {
    dispatch(getCourseLabs(courseId));
  }, []);

  if (getCourseLabsThunk.status === 'pending') {
    return {
      labs: [],
    };
  }

  const c = labs.find((l) => l.courseId === courseId);

  if (!c) {
    return {
      labs: [],
    };
  }

  return {
    labs: c.labs,
  };
};
