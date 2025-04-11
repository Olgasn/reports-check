import { useGroupStudents } from '@hooks';
import { FC } from 'react';
import { StudentItem } from './StudentItem';

interface Props {
  groupId: number;
}

export const Students: FC<Props> = ({ groupId }) => {
  const students = useGroupStudents(groupId);

  return (
    <div>
      {students.map((student) => (
        <StudentItem student={student} key={student.id} groupId={groupId} />
      ))}
    </div>
  );
};
