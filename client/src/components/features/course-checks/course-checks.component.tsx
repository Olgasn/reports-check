import { FC, useEffect, useId, useState } from 'react';

import {
  Box,
  Card,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';

import { useAllCourses, useCourseLabs } from '@api';
import { TopHeader } from '@shared';

import { LabLink } from './course-checks.styled';

export const CourseChecks: FC = () => {
  const [courseIndex, setCourseIndex] = useState(0);
  const { data: courses } = useAllCourses();
  const { data: labs } = useCourseLabs(courses?.[courseIndex]?.id || 0);
  const courseLabelId = useId();

  useEffect(() => {
    const selectedCourse = Number(localStorage.getItem('selectedCourse'));

    if (isNaN(selectedCourse)) {
      return;
    }

    setCourseIndex(selectedCourse);
  }, []);

  if (!courses || !labs) {
    return null;
  }

  const handleCourseChange = (e: SelectChangeEvent<number>) => {
    setCourseIndex(e.target.value);

    localStorage.setItem('selectedCourse', String(e.target.value));
  };

  return (
    <Box display="flex" flexDirection="column">
      <TopHeader
        text={'Проверки'}
        subText={'Здесь вы можете быстро перейти к проверке лабораторной работы.'}
      />

      <Divider flexItem sx={{ my: 2 }} />

      <FormControl fullWidth>
        <InputLabel id={courseLabelId}>Курс</InputLabel>
        <Select
          value={courseIndex}
          onChange={handleCourseChange}
          size="small"
          labelId={courseLabelId}
          label="Курс"
          sx={{ width: '300px', bgcolor: 'white' }}
        >
          {courses.map(({ id, name }, index) => (
            <MenuItem value={index} key={id}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider flexItem sx={{ my: 2 }} />

      <Box display="flex" flexDirection="column" gap={1}>
        {labs.map(({ id, name }) => (
          <Card sx={{ px: 2, py: 1 }}>
            <LabLink to={`/labs/${id}/check`}>{name}</LabLink>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
