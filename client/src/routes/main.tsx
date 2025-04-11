import { App } from '@components/App';
import { Course } from '@components/Course';
import { WithCourse } from '@components/CourseOne/WithCourse';
import { Groups } from '@components/Groups';
import { WithLab } from '@components/LabCheck/WithLab';
import { Settings } from '@components/Settings';
import { Tests } from '@components/Tests';
import { RouteObject } from 'react-router';

export const Routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
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
      {
        path: '/check-lab/:id',
        element: <WithLab />,
      },
      {
        path: '/groups',
        element: <Groups />,
      },
    ],
  },
];
