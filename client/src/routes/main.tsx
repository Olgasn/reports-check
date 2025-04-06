import { App } from '@components/App';
import { CheckForm } from '@components/Check';
import { Course } from '@components/Course';
import { CourseOne } from '@components/CourseOne';
import { WithCourse } from '@components/CourseOne/WithCourse';
import { Settings } from '@components/Settings';
import { Tests } from '@components/Tests';
import { RouteObject } from 'react-router';

export const Routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/check',
        element: <CheckForm />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/tests',
        element: <Tests />,
      },
      {
        path: '/courses',
        element: <Course />,
      },
      {
        path: '/courses/:id',
        element: <WithCourse />,
      },
    ],
  },
];
