import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Vacant } from './vacant.model';
import { Resume } from './resume.model';
import { EApplicationStatus } from '@/enums/application.enum';
import { AIModel } from './aiModel.model';

@Entity()
export class Application {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  // eslint-disable-next-line prettier/prettier
  @ManyToOne(() => Vacant, (vacant) => vacant.applications)
  @JoinColumn({ name: 'vacancy_id' })
  vacant: Relation<Vacant>;

  @ManyToOne(() => Resume, resume => resume.applications)
  @JoinColumn({ name: 'resume_id' })
  resume: Relation<Resume>;

  @Column({
    type: 'text',
    name: 'feed_back',
    nullable: true,
  })
  feedBack: string;

  @Column({
    type: 'float',
    name: 'affinity',
    nullable: true,
  })
  affinity: number;

  @Column({
    type: 'enum',
    enum: EApplicationStatus,
    default: EApplicationStatus.APPLIED,
    name: 'status',
  })
  status: EApplicationStatus;

  @Column({
    type: 'date',
    name: 'creation_date',
  })
  creationDate: Date;

  @Column({
    type: 'float',
    name: 'ia_time_taken',
    nullable: true,
    comment: 'tiempo tomado por la IA para analizar la Hoja de vida en milisegundos',
  })
  iaTimeTaken: Date;

  @ManyToOne(() => AIModel, aimodel => aimodel.id)
  @JoinColumn({ name: 'ai_model_id' })
  aiModel: Relation<AIModel>;
}
