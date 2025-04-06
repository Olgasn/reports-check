import { AppDispatch, getCourse, RootState } from '@store';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { CourseOne } from '..';

export const WithCourse: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const { courses, findOneCourseThunk } = useSelector((state: RootState) => state.course);
  const courseId = Number(id);

  if (isNaN(courseId)) {
    return null;
  }

  const course = courses.find((c) => c.id === courseId);

  if (!course && findOneCourseThunk.status === 'idle') {
    dispatch(getCourse(courseId));
  }

  if (!course && findOneCourseThunk.status === 'rejected') {
    return null;
  }

  if (!course) {
    return null;
  }

  return <CourseOne course={course} />;
};
