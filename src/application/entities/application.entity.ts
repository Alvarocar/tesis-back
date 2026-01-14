import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { EApplicationStatus } from 'src/shared/enums/application-status.enum';
import { Vacancy } from 'src/vacancy/entities/vacancy.entity';
import { Resume } from 'src/resume/entities/resume.entity';
import { AIModel } from 'src/shared/entities/ia-model.entity';

@Entity()
export class Application {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @ManyToOne(() => Vacancy, (vacant) => vacant.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vacancy_id' })
  vacancy: Relation<Vacancy>;

  @ManyToOne(() => Resume, (resume) => resume.applications, {
    onDelete: 'CASCADE',
  })
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
    comment:
      'tiempo tomado por la IA para analizar la Hoja de vida en milisegundos',
  })
  iaTimeTaken: Date;

  @Column({
    type: 'int',
    name: 'input_tokens',
    nullable: true,
  })
  inputTokens: number;

  @Column({
    type: 'int',
    name: 'output_tokens',
    nullable: true,
  })
  outputTokens: number;

  @ManyToOne(() => AIModel, (aimodel) => aimodel.id)
  @JoinColumn({ name: 'ai_model_id' })
  aiModel: Relation<AIModel>;
}
