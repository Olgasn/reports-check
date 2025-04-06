import { Lab } from 'src/lab/entities/lab.entity';
import { Student } from 'src/student/entities/student.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('checks')
export class Check {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  advantages: string;

  @Column()
  disadvantages: string;

  @Column()
  grade: number;

  @ManyToOne(() => Lab, (lab) => lab.checks)
  lab: Lab;

  @ManyToOne(() => Student, (student) => student.checks)
  student: Student;
}
