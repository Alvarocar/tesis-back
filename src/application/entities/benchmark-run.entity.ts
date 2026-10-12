import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Application } from './application.entity';

@Entity({ name: 'benchmark_run' })
export class BenchmarkRun {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Relation<Application>;

  @Column({ type: 'varchar', length: 120, name: 'model_name' })
  modelName: string;

  @Column({ type: 'int', name: 'run_index' })
  runIndex: number;

  @Column({ type: 'float', name: 'affinity', nullable: true })
  affinity: number;

  @Column({ type: 'text', name: 'feed_back', nullable: true })
  feedBack: string;

  @Column({ type: 'int', name: 'input_tokens', nullable: true })
  inputTokens: number;

  @Column({ type: 'int', name: 'output_tokens', nullable: true })
  outputTokens: number;

  @Column({
    type: 'float',
    name: 'duration_secs',
    nullable: true,
    comment: 'Tiempo de respuesta del LLM en segundos',
  })
  durationSecs: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
