import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  resume: typeof Resume;
}
