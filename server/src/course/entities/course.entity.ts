import { Group } from 'src/group/entities/group.entity';
import { Lab } from 'src/lab/entities/lab.entity';
import { Prompt } from 'src/prompt/entities/prompt.entity';
import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @OneToMany(() => Lab, (lab) => lab.course)
  labs: Lab[];
}
