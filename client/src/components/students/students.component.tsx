import { FC, useState } from 'react';
import { StudentsProps } from './students.types';
import { useGroupStudents } from '@api';
import { Box, Button, Divider } from '@mui/material';
import { StudentItem } from './student-item';
import { IStudent } from '@@types';
import { useModalControls } from '@hooks';
import { AddStudentModal } from './add-student-modal';
import { COLORS } from '@constants';
import { EditStudentModal } from './edit-student-modal';

export const Students: FC<StudentsProps> = ({ groupId }) => {
  const addStudentControls = useModalControls();
  const editStudentControls = useModalControls();

  const { data: students } = useGroupStudents(groupId);
  const [student, setStudent] = useState<IStudent | null>(null);

  const handleAddModalOpen = () => {
    addStudentControls.handleOpen();
  };

  if (!students) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" gap={1}>
        {students.map((item) => (
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
