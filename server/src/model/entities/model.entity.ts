import { Check } from 'src/check/entities/check.entity';
import { Key } from 'src/key/entities/key.entity';
import { Provider } from 'src/provider/entities/provider.entity';
import { LlmInterfaces } from 'src/types/reports.types';
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

  @Column({ default: 5 })
  maxRetries: number;

  @Column({ default: 2500 })
  queryDelay: number;

  @Column({ default: 10000 })
  errorDelay: number;

  @Column({ default: 10000 })
  max_tokens: number;

  @ManyToOne(() => Key, (key) => key.models, {
    onDelete: 'CASCADE',
  })
  key: Key | null;

  @ManyToOne(() => Provider, (provider) => provider.models, {
    onDelete: 'CASCADE',
  })
  provider: Provider | null;

  @Column()
  llmInterface: LlmInterfaces;

  @OneToMany(() => Check, (check) => check.model, {
    onDelete: 'CASCADE',
  })
  checks: Check[];
}
