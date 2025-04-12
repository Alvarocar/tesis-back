import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  vacant: typeof Vacant;

  @ManyToOne(() => Resume, resume => resume.applications)
  resume: typeof Resume;

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
    name: 'create_applicantion_date',
  })
  createApplicationDate: Date;

  @Column({
    type: 'float',
    name: 'ia_time_taken',
    nullable: true,
    comment: 'tiempo tomado por la IA para analizar la Hoja de vida en milisegundos',
  })
  iaTimeTaken: Date;

  @ManyToOne(() => AIModel, aimodel => aimodel.id)
  aiModel: typeof AIModel;
}
