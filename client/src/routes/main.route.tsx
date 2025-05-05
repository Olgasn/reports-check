import { App, CheckResults, Course, Courses, LabCheck, Settings } from '@components';
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
      {
        path: '/labs/:id/check',
        element: <LabCheck />,
      },
    ],
  },
];
