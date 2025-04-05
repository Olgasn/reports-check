import { Group } from 'src/group/entities/group.entity';
import { Prompt } from 'src/prompt/entities/prompt.entity';
import { Column, Entity, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => Group, (group) => group.courses)
  groups: Group[];

  @OneToOne(() => Prompt, (prompt) => prompt.course)
  prompt: Prompt;
}
