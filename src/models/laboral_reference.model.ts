import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Resume } from './resume.model';

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
  })
  number: string;

  @Column({
    type: 'varchar',
    length: 60,
  })
  rol: string;

  @Column({
    type: 'varchar',
    length: 60,
  })
  company: string;

  @ManyToOne(() => Resume, resume => resume.laboral_references)
  resume: Resume;
}
