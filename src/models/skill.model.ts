import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Resume } from './resume.model';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
  })
  name: string;

  @ManyToOne(() => Resume, resume => resume.skills)
  @JoinColumn({ name: 'resume_id' })
  resume: Relation<Resume>;
}
