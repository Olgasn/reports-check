import { Check } from 'src/check/entities/check.entity';
import { Group } from 'src/group/entities/group.entity';
import { Lab } from 'src/lab/entities/lab.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column()
  middlename: string;

  @ManyToOne(() => Group, (group) => group.students, {
    onDelete: 'CASCADE',
  })
  group: Group;

  @OneToMany(() => Lab, (lab) => lab.checks, {
    onDelete: 'CASCADE',
  })
  checks: Check[];
}
