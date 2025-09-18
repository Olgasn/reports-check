import {
  CheckResults,
  Course,
  CourseChecks,
  CourseResults,
  Courses,
  Groups,
  LabCheck,
  Settings,
} from '@features';
import { App } from '@shared';
import { Navigate, RouteObject } from 'react-router-dom';

export const Routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/courses" replace />,
      },
      {
        path: '/results',
        element: <CourseResults />,
      },
      {
        path: '/checks',
        element: <CourseChecks />,
      },
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
      {
        path: '/groups',
        element: <Groups />,
      },
    ],
  },
];
