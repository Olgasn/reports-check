import { ICourse } from '@@types';
import { FC } from 'react';
import { CourseDescription, CourseHeader, CourseHeaderDiv, CourseItemDiv } from './styled';
import { Dropdowns } from '@components/Settings/Dropdowns';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, deleteCourse, RootState, setCourse, setEditModal } from '@store';

export const CourseItem: FC<ICourse> = ({ id, name, description }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { courses } = useSelector((state: RootState) => state.course);

  return (
    <CourseItemDiv>
      <CourseHeaderDiv>
        <CourseHeader>{name}</CourseHeader>
        <Dropdowns
          actions={[
            {
              text: 'Редактировать',
              icon: faPenToSquare,
              cb: (id: number) => {
                const course = courses.find((c) => c.id === id);

                if (!course) {
                  return;
                }

                dispatch(setCourse(course));
                dispatch(setEditModal(true));
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

                dispatch(deleteCourse(id));
              },
            },
          ]}
          itemId={id}
        />
      </CourseHeaderDiv>

      <CourseDescription>{description}</CourseDescription>
    </CourseItemDiv>
  );
};
