import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Resume } from './resume.entity';

@Entity()
export class PersonalReference {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    name: 'name',
    length: 60,
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'phone_number',
    length: 60,
  })
  phoneNumber: string;

  @Column({
    type: 'varchar',
    name: 'relationship',
    length: 60,
  })
  relationship: string;

  @ManyToOne(() => Resume, resume => resume.personal_references)
  @JoinColumn({ name: 'resume_id' })
  resume: Relation<Resume>;
}
