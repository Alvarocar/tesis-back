import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  })
  institute: string;

  @Column({
    type: 'varchar',
    length: 60,
  })
  tittle: string;

  @Column({
    type: 'date',
  })
  start_date: Date;

  @Column({
    type: 'date',
  })
  end_date: Date;

  @ManyToOne(() => Resume, resume => resume.educations)
  resume: Resume;
}
