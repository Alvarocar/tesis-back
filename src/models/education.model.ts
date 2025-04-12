import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
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
  title: string;

  @Column({
    type: 'date',
  })
  start_date: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  end_date?: Date;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  keep_study?: boolean;

  @ManyToOne(() => Resume, resume => resume.educations)
  resume: Relation<Resume>;
}
