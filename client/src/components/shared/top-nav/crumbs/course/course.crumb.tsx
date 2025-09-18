import { FC } from 'react';

import { Breadcrumbs, Typography } from '@mui/material';

import { useNavigate } from 'react-router';

import { CrumbDiv } from '../crumbs.styled';

import { CourseCrumbProps } from './course.types';

export const CourseCrumb: FC<CourseCrumbProps> = ({ courseName }) => {
  const navigate = useNavigate();

  const navigateToCourses = () => navigate('/courses');

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <CrumbDiv onClick={navigateToCourses}>
        <Typography sx={{ color: 'GrayText' }}>Курсы</Typography>
      </CrumbDiv>

      <Typography sx={{ color: 'text.primary' }}>{courseName}</Typography>
    </Breadcrumbs>
  );
};
