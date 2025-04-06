import { Check } from 'src/check/entities/check.entity';
import { Course } from 'src/course/entities/course.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';

@Entity('labs')
export class Lab {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  filename: string;

  @Column()
  filepath: string;

  @Column()
  filesize: number;

  @ManyToOne(() => Course, (course) => course.labs)
  course: Course;

  @OneToMany(() => Check, (check) => check.lab)
  checks: Check[];
}
