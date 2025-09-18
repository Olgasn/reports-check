import { FC, useEffect, useState } from 'react';

import { Box, Button, Divider, Pagination } from '@mui/material';

import { IStudent } from '@@types';
import { useGroupStudents } from '@api';
import { COLORS } from '@constants';
import { useModalControls } from '@hooks';

import { AddStudentModal } from '../add-student-modal';
import { EditStudentModal } from '../edit-student-modal';
import { StudentItem } from '../student-item';

import { StudentsProps } from './students.types';

export const Students: FC<StudentsProps> = ({ groupId, search }) => {
  const addStudentControls = useModalControls();
  const editStudentControls = useModalControls();

  const [page, setPage] = useState(1);

  const { data: students } = useGroupStudents({ groupId, pageSize: 10, page, search });
  const [student, setStudent] = useState<IStudent | null>(null);

  const handleAddModalOpen = () => {
    addStudentControls.handleOpen();
  };

  const handlePageChange = (_: unknown, value: number) => {
    setPage(value);
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (!students) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" gap={1}>
        {students.items.map((item) => (
          <>
            <StudentItem
              item={item}
              key={item.id}
              editCb={() => {
                editStudentControls.handleOpen();
                setStudent(item);
              }}
            />
            <Divider flexItem sx={{ my: 1 }} />
          </>
        ))}
      </Box>

      <Box display="flex" justifyContent="center">
        <Pagination count={students.total} page={page} onChange={handlePageChange} />
      </Box>

      <Button
        variant="contained"
        sx={{
          background: COLORS.MENU_BG,
          mt: 2,
          textTransform: 'none',
        }}
        onClick={handleAddModalOpen}
      >
        Добавить
      </Button>

      <AddStudentModal
        groupId={groupId}
        isOpen={addStudentControls.open}
        onClose={addStudentControls.handleClose}
      />

      {student && (
        <EditStudentModal
          groupId={groupId}
          isOpen={editStudentControls.open}
          onClose={editStudentControls.handleClose}
          item={student}
        />
      )}
    </Box>
  );
};
