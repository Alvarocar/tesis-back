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
export class LaboralReference {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'phone_number',
  })
  phoneNumber: string;

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

  @ManyToOne(() => Resume, (resume) => resume.laboral_references, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resume_id' })
  resume: Relation<Resume>;
}
