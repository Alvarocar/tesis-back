import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Resume } from './resume.model';

@Entity()
export class PersonalReference {
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
  relationship: string;

  @ManyToOne(() => Resume, resume => resume.personal_references)
  resume: Resume;
}
