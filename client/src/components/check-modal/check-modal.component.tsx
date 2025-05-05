import { FC } from 'react';
import { CheckModalProps } from './check-modal.types';
import { Box, Divider } from '@mui/material';
import { Modal } from '../modal';
import { useChecks } from '@api';
import { ResultItem } from '../result-item';
import { Avatar } from '../avatar';

export const CheckModal: FC<CheckModalProps> = ({ isOpen, onClose, ids }) => {
  const { data: checks } = useChecks({ ids });

  if (!checks) {
    return null;
  }

  const body = (
    <Box display="flex" flexDirection="column">
      {checks.map((check, index) => (
        <Box>
          <Divider flexItem sx={{ mt: index ? 2 : 0, mb: 2 }} />

          <Box
            sx={{
              mt: index ? 2 : 0,
              mb: 2,
            }}
          >
            <Avatar
              text={`${check.student.name} ${check.student.surname} ${check.student.middlename}`}
            />
          </Box>

          <ResultItem {...check} />
        </Box>
      ))}
    </Box>
  );

  return (
    <Modal
      onClose={onClose}
      open={isOpen}
      title="Результаты проверки"
      body={body}
      sx={{
        width: '75vw',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    />
  );
};
