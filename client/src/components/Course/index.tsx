import { TopHeader } from '@components/TopHeader';
import { FC, useEffect } from 'react';
import { CourseItem } from './CourseItem';
import { CourseDivItems, CourseLineDiv, HeadDiv } from './styled';
import { split } from '@utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, getCourses, RootState, setAddModal, setEditModal } from '@store';
import { ModalBtn } from '@components/Settings/KeysSettings/KeyEditModal/styled';
import { CourseAddModal } from './AddCourse';
import { EditCourseModal } from './EditCourse';

export const Course: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { courses, getCoursesThunk, addModalOpen, course, editModalOpen } = useSelector(
    (state: RootState) => state.course
  );

  const handleEditModalClose = () => {
    dispatch(setEditModal(false));
  };

  const handleAddModalClose = () => {
    dispatch(setAddModal(false));
  };

  const handleAddModalOpen = () => {
    dispatch(setAddModal(true));
  };

  useEffect(() => {
    dispatch(getCourses());
  }, []);

  const coursesSplitted = split(courses, 3);

  return (
    <div>
      <HeadDiv>
        <TopHeader text="Курсы" subText="Здесь вы можете создавать и редактировать курсы." />

        <ModalBtn onClick={handleAddModalOpen}>Добавить</ModalBtn>
      </HeadDiv>

      <hr />

      <CourseDivItems>
        {coursesSplitted.map((line, index) => (
          <CourseLineDiv key={index}>
            {line.map((item) => (
              <CourseItem key={item.id} {...item} />
            ))}
          </CourseLineDiv>
        ))}
      </CourseDivItems>

      <CourseAddModal isShow={addModalOpen} handleClose={handleAddModalClose} />
      {course && (
        <EditCourseModal isShow={editModalOpen} handleClose={handleEditModalClose} item={course} />
      )}
    </div>
  );
};
