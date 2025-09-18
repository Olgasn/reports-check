import { Model } from 'src/model/entities/model.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @OneToMany(() => Model, (model) => model.provider, {
    onDelete: 'CASCADE',
  })
  models: Model[];
}
