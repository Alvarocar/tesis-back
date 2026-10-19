import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Resume } from './resume.entity';
import { EEducationLevel } from 'src/shared/enums/education-level.enum';
import { Country } from 'src/shared/db/entities/country.entity';

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
    type: 'enum',
    name: 'education_level',
    enum: EEducationLevel,
    nullable: true,
  })
  educationLevel?: EEducationLevel | null;

  @Column({
    type: 'varchar',
    length: 120,
    name: 'program_name',
    nullable: true,
  })
  programName?: string | null;

  @ManyToOne(() => Country, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'country_id' })
  country?: Relation<Country> | null;

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
  endDate?: Date | null;

  @Column({
    type: 'boolean',
    name: 'keep_study',
    nullable: true,
  })
  keepStudy?: boolean;

  @ManyToOne(() => Resume, (resume) => resume.educations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resume_id' })
  resume: Relation<Resume>;
}
