import { ICourse } from '@@types';
import { Dropdowns } from '@components/Settings/Dropdowns';
import { TopHeader } from '@components/TopHeader';
import { FC } from 'react';
import { CourseHeader } from './styled';
import { EditCourseModal } from '@components/Course/EditCourse';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import {
  AppDispatch,
  RootState,
  setEditModal,
  setCourse,
  deleteCourse,
  setAddLabModal,
  setEditLabModal,
} from '@store';
import { useDispatch, useSelector } from 'react-redux';
import { Prompt } from './Prompt';
import { useLabs } from '@hooks';
import { FormBtn } from '@components/Check/styled';
import { AddLabModal } from './Lab/AddLabModel';
import { Lab } from './Lab';
import { EditLabModal } from './Lab/EditLabModel';

interface Props {
  course: ICourse;
}

export const CourseOne: FC<Props> = ({ course }) => {
  const { labs } = useLabs(course.id);
  const dispatch = useDispatch<AppDispatch>();

  const { courses, editModalOpen } = useSelector((state: RootState) => state.course);
  const { addLabModal, lab, editLabModel } = useSelector((state: RootState) => state.labs);

  const handleAddModalClose = () => {
    dispatch(setAddLabModal(false));
  };

  const handleAddModelOpen = () => {
    dispatch(setAddLabModal(true));
  };

  const handleEditModalClose = () => {
    dispatch(setEditModal(false));
  };

  const handleCloseEditLabModal = () => {
    dispatch(setEditLabModal(false));
  };

  const actions = [
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
  ];

  return (
    <div>
      <CourseHeader>
        <TopHeader text={course.name} subText={course.description} />

        <Dropdowns actions={actions} itemId={course.id} />
      </CourseHeader>

      <hr />

      <Prompt prompt={course.prompt} courseId={course.id} />

      <hr />

      {course && (
        <EditCourseModal isShow={editModalOpen} handleClose={handleEditModalClose} item={course} />
      )}

      <CourseHeader>
        <TopHeader text="Лабораторные работы" subText="Список лабораторных работ" />

        <FormBtn onClick={handleAddModelOpen}>Добавить</FormBtn>
      </CourseHeader>

      <hr />

      {labs.map((l) => (
        <Lab item={l} courseId={course.id} key={l.id} />
      ))}

      <AddLabModal isShow={addLabModal} handleClose={handleAddModalClose} courseId={course.id} />

      {lab && (
        <EditLabModal
          isShow={editLabModel}
          item={lab}
          handleClose={handleCloseEditLabModal}
          courseId={course.id}
        />
      )}
    </div>
  );
};
