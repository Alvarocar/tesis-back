import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
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
  endDate?: Date;

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
  description: String;

  @ManyToOne(() => Resume, resume => resume.experiences)
  @JoinColumn({ name: 'resume_id' })
  resume: Relation<Resume>;
}
