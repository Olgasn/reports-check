import { Check } from 'src/check/entities/check.entity';
import { Key } from 'src/key/entities/key.entity';
import { Providers } from 'src/types/reports.types';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity('models')
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  value: string;

  @Column('float', { default: 1.0 })
  top_p: number;

  @Column('float', { default: 1.0 })
  temperature: number;

  @Column({ default: null })
  max_tokens: number;

  @ManyToOne(() => Key, (key) => key.models, {
    onDelete: 'CASCADE',
  })
  key: Key;

  @Column({ default: Providers.OpenRouter })
  provider: Providers;

  @OneToMany(() => Check, (check) => check.model, {
    onDelete: 'CASCADE',
  })
  checks: Check[];
}
