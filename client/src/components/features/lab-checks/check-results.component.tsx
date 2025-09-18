import { FC, useState } from 'react';

import { Box, Chip, Divider, Typography } from '@mui/material';

import { useLab, useLabChecks } from '@api';
import { COLORS, PARAMS } from '@constants';
import { CheckResultsCrumb, StudentCheck, TopHeader } from '@shared';
import { useParams } from 'react-router';

export const CheckResults: FC = () => {
  const [groupIndex, setGroupIndex] = useState(0);

  const { id } = useParams();
  const labId = Number(id);

  const { data: checks } = useLabChecks(labId);
  const { data: lab } = useLab(labId);

  if (!checks || !lab) {
    return null;
  }

  if (!checks.length) {
    return (
      <Box>
        <Typography
          sx={{
            color: COLORS.TEXT,
            fontSize: PARAMS.MEDIUM_FONT_SIZE,
          }}
        >
          По данном работе нет результатов.
        </Typography>
      </Box>
    );
  }

  const groupChecks = checks[groupIndex];

  return (
    <Box>
      <CheckResultsCrumb
        labId={lab.id}
        labName={lab.name}
        courseName={lab.course.name}
        courseId={lab.course.id}
      />

      <Divider flexItem sx={{ my: 2 }} />

      <TopHeader text={lab.name} subText={lab.description} />

      <Divider flexItem sx={{ my: 2 }} />

      <Box>
        {checks.map((check, index) => (
          <Chip
            label={check.group.name}
            key={check.group.id}
            sx={{
              background: index === groupIndex ? COLORS.SECONDARY : undefined,
              color: index === groupIndex ? 'white' : undefined,
            }}
            onClick={() => setGroupIndex(index)}
          />
        ))}
      </Box>

      <Divider flexItem sx={{ my: 2 }} />

      <Box>
        {groupChecks.results.map(({ student, checks }) => (
          <StudentCheck student={student} checks={checks} key={student.id} />
        ))}
      </Box>
    </Box>
  );
};
