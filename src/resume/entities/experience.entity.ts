import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Resume } from './resume.entity';

@Entity()
export class Experience {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'rol',
  })
  rol: string;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'company',
  })
  company: string;

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
    name: 'keep_working',
    nullable: true,
  })
  keepWorking?: boolean;

  @Column({
    type: 'text',
    name: 'description',
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'country',
    nullable: true,
  })
  country?: string | null;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'department',
    nullable: true,
  })
  department?: string | null;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'city',
    nullable: true,
  })
  city?: string | null;

  @ManyToOne(() => Resume, (resume) => resume.experiences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resume_id' })
  resume: Relation<Resume>;
}
