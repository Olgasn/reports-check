import { AppDispatch, getCourses, RootState } from '@store';
import { useDispatch, useSelector } from 'react-redux';

export const useCourses = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, getCoursesThunk } = useSelector((state: RootState) => state.course);

  if (getCoursesThunk.status === 'idle') {
    dispatch(getCourses());
  }

  return courses;
};
