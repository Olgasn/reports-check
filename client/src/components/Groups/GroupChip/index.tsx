import { IGroup } from '@@types';
import { Action, Dropdowns } from '@components/Settings/Dropdowns';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FC, useState } from 'react';
import { GroupChipDiv, GroupChipText } from './styled';
import { faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { EditGroupModal } from '../EditGroupModal';
import { useDispatch } from 'react-redux';
import { AppDispatch, deleteGroup, groupActions } from '@store';
import { AddStudentModal } from '../Students/AddStudentModal';

interface Props {
  group: IGroup;
}

export const GroupChip: FC<Props> = ({ group }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [editVisible, setEditVisible] = useState(false);
  const [addStudentModal, setAddStudentModal] = useState(false);

  const { name, id } = group;

  const handleEditOpen = () => {
    setEditVisible(true);
  };

  const handleEditClose = () => {
    setEditVisible(false);
  };

  const handleAddStudentOpen = () => {
    setAddStudentModal(true);
  };

  const handleAddStudentClose = () => {
    setAddStudentModal(false);
  };

  const actions: Action[] = [
    {
      text: 'Редактировать',
      icon: faPenToSquare,
      cb: () => {
        handleEditOpen();
      },
    },
    {
      text: 'Удалить',
      icon: faTrashCan,
      cb: () => {
        const confirmed = window.confirm('Вы действительно хотите удалить элемент?');

        if (!confirmed) {
          return;
        }

        dispatch(deleteGroup(group.id));
      },
    },
    {
      text: 'Студенты',
      icon: faUsers,
      cb: () => {
        dispatch(groupActions.setGroup(group));
      },
    },
    {
      icon: faUserPlus,
      text: 'Добавить студента',
      cb: () => {
        handleAddStudentOpen();
      },
    },
  ];

  return (
    <GroupChipDiv key={id}>
      <GroupChipText>{name}</GroupChipText>

      <Dropdowns
        actions={actions}
        itemId={id}
        sx={{
          color: 'white',
          fontSize: '14px',
        }}
      />

      <EditGroupModal isShow={editVisible} handleClose={handleEditClose} group={group} />
      <AddStudentModal
        isShow={addStudentModal}
        handleClose={handleAddStudentClose}
        groupId={group.id}
      />
    </GroupChipDiv>
  );
};
