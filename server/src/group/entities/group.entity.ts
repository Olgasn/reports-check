import { Course } from 'src/course/entities/course.entity';
import { Student } from 'src/student/entities/student.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable, ManyToMany } from 'typeorm';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Student, (student) => student.group, {
    onDelete: 'CASCADE',
  })
  students: Student[];

  @ManyToMany(() => Course, (course) => course.groups, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  courses: Course[];
}
