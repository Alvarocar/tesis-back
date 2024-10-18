import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Resume } from './resume.model';

@Entity()
export class Experience {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

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
  keep_working?: boolean;

  @Column({
    type: 'text',
  })
  description: String;

  @ManyToOne(() => Resume, resume => resume.experiences)
  resume: Resume;
}
