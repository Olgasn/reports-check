import { FC, useState } from 'react';

import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider } from '@mui/material';

import { ICheckItem } from '@@types';
import { COLORS } from '@constants';
import { useModalControls } from '@hooks';
import { Avatar } from '@shared';

import { StudentResultModal } from '../student-result-modal';

import { StudenText } from './student-check.styled';
import { StudentCheckProps } from './student-check.types';

export const StudentCheck: FC<StudentCheckProps> = ({ student, checks }) => {
  const { name, surname, middlename } = student;
  const studentStr = `${name} ${surname} ${middlename}`;

  const resultModalControls = useModalControls();

  const [result, setResult] = useState<ICheckItem | null>(null);

  const handleResultOpen = (item: ICheckItem) => () => {
    setResult(item);

    resultModalControls.handleOpen();
  };

  const handleResultClose = () => {
    setResult(null);

    resultModalControls.handleClose();
  };

  const studentChecks = checks.map((check) => {
    const date = new Date(check.date);

    return (
      <>
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box display="flex" flexDirection="row">
            <StudenText>{date.toLocaleString()}</StudenText>
            <StudenText>{check.model.name}</StudenText>
            <StudenText>{check.grade}/10</StudenText>
          </Box>

          <Button
            variant="outlined"
            sx={{ color: COLORS.SECONDARY, borderColor: COLORS.SECONDARY }}
            onClick={handleResultOpen(check)}
          >
            Подробнее
          </Button>
        </Box>

        <Divider flexItem sx={{ my: 2 }} />
      </>
    );
  });

  return (
    <Accordion key={student.id}>
      <AccordionSummary>
        <Box display="flex" flexDirection="row" alignItems="center">
          <Avatar text={studentStr} />

          <StudenText>{student.num}</StudenText>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Divider flexItem sx={{ mb: 2 }} />
        {studentChecks}
      </AccordionDetails>

      {result && (
        <StudentResultModal
          onClose={handleResultClose}
          isOpen={resultModalControls.open}
          data={result}
          studentStr={studentStr}
        />
      )}
    </Accordion>
  );
};
