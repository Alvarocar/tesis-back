import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Resume } from './resume.model';

@Entity()
export class Education {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'institute',
  })
  institute: string;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'title',
  })
  title: string;

  @Column({
    type: 'date',
    name: 'start_date',
  })
  startDate: Date;

  @Column({
    type: 'date',
    name: 'end_date',
    nullable: true,
  })
  endDate?: Date;

  @Column({
    type: 'boolean',
    name: 'keep_study',
    nullable: true,
  })
  keepStudy?: boolean;

  @ManyToOne(() => Resume, resume => resume.educations)
  @JoinColumn({ name: 'resume_id' })
  resume: Relation<Resume>;
}
