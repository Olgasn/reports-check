import { FC } from 'react';

import { Breadcrumbs, Typography } from '@mui/material';

import { useNavigate } from 'react-router';

import { CrumbDiv } from '../crumbs.styled';

import { CheckResultsProps } from './check-results.types';

export const CheckResultsCrumb: FC<CheckResultsProps> = ({
  courseId,
  courseName,
  labName,
  labId,
}) => {
  const navigate = useNavigate();

  const navigateToCourse = () => navigate(`/courses/${courseId}`);
  const navigateToCourses = () => navigate('/courses');
  const navigateToLab = () => navigate(`/labs/${labId}/check`);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <CrumbDiv onClick={navigateToCourses}>
        <Typography sx={{ color: 'GrayText' }}>Курсы</Typography>
      </CrumbDiv>

      <CrumbDiv onClick={navigateToCourse}>
        <Typography sx={{ color: 'GrayText' }}>{courseName}</Typography>
      </CrumbDiv>

      <CrumbDiv onClick={navigateToLab}>
        <Typography sx={{ color: 'GrayText' }}>{labName}</Typography>
      </CrumbDiv>

      <Typography sx={{ color: 'text.primary' }}>Результаты</Typography>
    </Breadcrumbs>
  );
};
