import { FC, useState } from 'react';

import { Box, Button, Divider } from '@mui/material';

import { useChecks } from '@api';
import { useModalControls } from '@hooks';
import { Avatar, CheckCopyBtn, Modal, ResultItem, TaskModal } from '@shared';

import { CheckModalProps } from './check-modal.types';

export const CheckModal: FC<CheckModalProps> = ({ isOpen, onClose, ids }) => {
  const { data: checks } = useChecks({ ids });
  const taskControls = useModalControls();

  const handleTaskOpen = (task: string, st: string) => () => {
    setReport(task);
    setSt(st);

    taskControls.handleOpen();
  };

  const handleTaskClose = () => {
    setReport('');
    setSt('');

    taskControls.handleClose();
  };

  const [report, setReport] = useState('');
  const [st, setSt] = useState('');

  if (!checks) {
    return null;
  }

  const body = (
    <Box display="flex" flexDirection="column">
      {checks.map((check, index) => {
        const stStr = `${check.student.name} ${check.student.surname} ${check.student.middlename}`;

        return (
          <Box display="flex" flexDirection="column">
            <Divider flexItem sx={{ mt: index ? 2 : 0, mb: 2 }} />

            <Box
              sx={{
                mt: index ? 2 : 0,
                mb: 2,
              }}
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
            >
              <Avatar text={stStr} />

              <CheckCopyBtn {...check} studentStr={stStr} />
            </Box>

            <ResultItem {...check} />

            <Button
              variant="outlined"
              sx={{ my: 2, flexGrow: 1 }}
              onClick={handleTaskOpen(check.report, stStr)}
            >
              Отчет
            </Button>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <>
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

      {report && (
        <TaskModal title={st} task={report} onClose={handleTaskClose} isOpen={taskControls.open} />
      )}
    </>
  );
};
