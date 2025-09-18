import { FC } from 'react';

import { Breadcrumbs, Typography } from '@mui/material';

import { useNavigate } from 'react-router';

import { CrumbDiv } from '../crumbs.styled';

import { LabCrumbProps } from './lab.types';

export const LabCrumb: FC<LabCrumbProps> = ({ courseId, courseName, labName }) => {
  const navigate = useNavigate();

  const navigateToCourse = () => navigate(`/courses/${courseId}`);
  const navigateToCourses = () => navigate('/courses');

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <CrumbDiv onClick={navigateToCourses}>
        <Typography sx={{ color: 'GrayText' }}>Курсы</Typography>
      </CrumbDiv>

      <CrumbDiv onClick={navigateToCourse}>
        <Typography sx={{ color: 'GrayText' }}>{courseName}</Typography>
      </CrumbDiv>

      <Typography sx={{ color: 'text.primary' }}>{labName}</Typography>
    </Breadcrumbs>
  );
};
