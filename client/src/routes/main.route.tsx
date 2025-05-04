import { App, CheckResults, Course, Courses, Settings } from '@components';
import { RouteObject } from 'react-router-dom';

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
        path: '/courses',
        element: <Courses />,
      },
      {
        path: '/courses/:id',
        element: <Course />,
      },
      {
        path: '/labs/:id/checks',
        element: <CheckResults />,
      },
    ],
  },
];
