import { IStudent } from '@@types';
import { Avatar } from '@mui/material';
import { stringAvatar } from '@utils';
import { FC, useState } from 'react';
import { StudentAvatarDiv, StudentItemDiv, StudentName } from './styled';
import { Dropdowns } from '@components/Settings/Dropdowns';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { EditStudentModal } from '../EditStudentModal';
import { useDispatch } from 'react-redux';
import { AppDispatch, deleteStudent } from '@store';

interface Props {
  student: IStudent;
  groupId: number;
}

export const StudentItem: FC<Props> = ({ student, groupId }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [editOpen, setEditOpen] = useState(false);
  const textName = `${student.name} ${student.surname} ${student.middlename}`;

  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const actions = [
    {
      text: 'Редактировать',
      icon: faPenToSquare,
      cb: (id: number) => {
        handleEditOpen();
      },
    },
    {
      text: 'Удалить',
      icon: faTrashCan,
      cb: (id: number) => {
        const confirmed = window.confirm('Вы действительно хотите удалить элемент?');

        if (!confirmed) {
          return;
        }

        dispatch(deleteStudent(student.id));
      },
    },
  ];

  return (
    <StudentItemDiv>
      <StudentAvatarDiv>
        <Avatar {...stringAvatar(textName)} />
        <StudentName>{textName}</StudentName>
      </StudentAvatarDiv>

      <Dropdowns actions={actions} itemId={-1} />

      <EditStudentModal
        isShow={editOpen}
        handleClose={handleEditClose}
        student={student}
        groupId={groupId}
      />
    </StudentItemDiv>
  );
};
