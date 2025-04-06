import { ILab } from '@@types';
import { FC } from 'react';
import { LabDesc, LabDiv, LabHeader, LabHeaderText } from './styled';
import { Action, Dropdowns } from '@components/Settings/Dropdowns';
import { useDispatch } from 'react-redux';
import { AppDispatch, deleteLab, setEditLabModal, setLab } from '@store';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

interface Props {
  item: ILab;
  courseId: number;
}

export const Lab: FC<Props> = ({ item, courseId }) => {
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
  ];

  return (
    <LabDiv>
      <LabHeader>
        <LabHeaderText>{item.name}</LabHeaderText>
        <Dropdowns actions={actions} itemId={item.id} />
      </LabHeader>

      <LabDesc>{item.description}</LabDesc>
    </LabDiv>
  );
};
