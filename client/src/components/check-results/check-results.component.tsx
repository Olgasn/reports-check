import { useLab, useLabChecks } from '@api';
import { StudentCheck, TopHeader } from '@components';
import { COLORS } from '@constants';
import { Box, Chip, Divider } from '@mui/material';
import { FC, useState } from 'react';
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

  const groupChecks = checks[groupIndex];

  return (
    <Box>
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
