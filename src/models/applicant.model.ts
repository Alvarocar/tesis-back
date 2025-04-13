import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Resume } from './resume.model';
import { EIdentificationType } from '@/enums/applicant.enum';

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
    name: 'email',
    length: 60,
  })
  email: string;

  @Column({
    type: 'varchar',
    name: 'password',
    length: 60,
  })
  password: string;

  @Column({
    type: 'boolean',
    name: 'is_active',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'date',
    name: 'creation_date',
  })
  creationDate: Date;

  @Column({
    type: 'date',
    name: 'modification_date',
  })
  modificationDate: Date;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'direction',
    length: 60,
  })
  direction: string;

  @Column({
    type: 'varchar',
    name: 'identification',
    length: 60,
    nullable: true,
  })
  identification: string;

  @Column({
    nullable: true,
    type: 'enum',
    name: 'identification_type',
    enum: EIdentificationType,
  })
  identificationType: EIdentificationType;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'phone_number',
    length: 60,
  })
  phoneNumber: string;

  @Column({
    nullable: true,
    type: 'date',
    name: 'birth_date',
  })
  birthDate: Date;

  @OneToMany(() => Resume, resume => resume.applicant)
  resumes: Relation<Resume>[];
}
