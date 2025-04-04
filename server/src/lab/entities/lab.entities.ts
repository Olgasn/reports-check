import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('labs')
export class Lab {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;
}
