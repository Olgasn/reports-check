import { Model } from 'src/model/entities/model.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('keys')
export class Key {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  value: string;

  @OneToMany(() => Model, (model) => model.key, {
    onDelete: 'CASCADE',
  })
  models: Model[];
}
