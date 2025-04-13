import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Resume } from './resume.model';

@Entity()
export class Applicant {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    name: 'first_name',
    length: 60,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    name: 'last_name',
    length: 60,
    nullable: true,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 60,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 60,
  })
  password: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  is_active: boolean;

  @Column({
    type: 'date',
  })
  creation_date: Date;

  @Column({
    type: 'date',
  })
  modification_date: Date;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 60,
  })
  direction: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  identification: number;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 60,
  })
  phone_number: string;

  @Column({
    nullable: true,
    type: 'date',
  })
  birth_date: Date;

  @OneToMany(() => Resume, resume => resume.applicant)
  resumes: Relation<Resume>[];
}
