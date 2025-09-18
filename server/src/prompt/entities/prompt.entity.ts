import { Course } from 'src/course/entities/course.entity';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from 'typeorm';

@Entity('prompts')
export class Prompt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @OneToOne(() => Course, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  course: Course;
}
