import { Lab } from 'src/lab/entities/lab.entity';
import { Model } from 'src/model/entities/model.entity';
import { Student } from 'src/student/entities/student.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

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

  @Column()
  review: string;

  @Column({ default: '' })
  report: string;

  @CreateDateColumn()
  date: Date;

  @ManyToOne(() => Lab, (lab) => lab.checks, {
    onDelete: 'CASCADE',
  })
  lab: Lab;

  @ManyToOne(() => Model, (model) => model.checks, {
    onDelete: 'CASCADE',
  })
  model: Model;

  @ManyToOne(() => Student, (student) => student.checks, {
    onDelete: 'CASCADE',
  })
  student: Student;
}
