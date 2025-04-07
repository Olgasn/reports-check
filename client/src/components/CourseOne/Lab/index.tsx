import { ILab } from '@@types';
import { FC, useState } from 'react';
import { LabDesc, LabDiv, LabHeader, LabHeaderText } from './styled';
import { Action, Dropdowns } from '@components/Settings/Dropdowns';
import { useDispatch } from 'react-redux';
import { AppDispatch, deleteLab, setEditLabModal, setLab } from '@store';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { LabTask } from './LabTask';
import { faCircleCheck, faFileLines } from '@fortawesome/free-regular-svg-icons';
import { TaskModal } from './TaskModal';
import { useNavigate } from 'react-router';

interface Props {
  item: ILab;
  courseId: number;
}

export const Lab: FC<Props> = ({ item, courseId }) => {
  const navigate = useNavigate();
  const [taskVisible, setTaskVisible] = useState(false);

  const handleTaskClose = () => {
    setTaskVisible(false);
  };

  const handleTaskOpen = () => {
    setTaskVisible(true);
  };

  const dispatch = useDispatch<AppDispatch>();

  const actions: Action[] = [
    {
      text: 'Редактировать',
      icon: faPenToSquare,
      cb: () => {
        dispatch(setEditLabModal(true));
        dispatch(setLab(item));
      },
    },
    {
      text: 'Удалить',
      icon: faTrashCan,
      cb: () => {
        const confirmed = window.confirm('Вы действительно хотите удалить запись?');

        if (!confirmed) {
          return;
        }

        dispatch(
          deleteLab({
            labId: item.id,
            courseId,
          })
        );
      },
    },
    {
      text: 'Задание',
      icon: faFileLines,
      cb: () => {
        handleTaskOpen();
      },
    },
    {
      text: 'Проверка',
      icon: faCircleCheck,
      cb: () => {
        navigate(`/check-lab/${item.id}`);
      },
    },
  ];

  return (
    <LabDiv>
      <LabHeader>
        <LabHeaderText>{item.name}</LabHeaderText>
        <Dropdowns actions={actions} itemId={item.id} />
      </LabHeader>

      <LabDesc>{item.description}</LabDesc>

      <hr />

      <LabTask filename={item.filename} filesize={item.filesize} />

      <TaskModal
        isShow={taskVisible}
        handleClose={handleTaskClose}
        content={item.content}
        name={item.name}
      />
    </LabDiv>
  );
};
