import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Resume } from 'src/resume/entities/resume.entity';
import { Country } from 'src/shared/db/entities/country.entity';
import { Department } from 'src/shared/db/entities/department.entity';
import { City } from 'src/shared/db/entities/city.entity';
import { ESex } from 'src/shared/enums/sex.enum';
import { EGender } from 'src/shared/enums/gender.enum';
import { ESexualOrientation } from 'src/shared/enums/sexual-orientation.enum';
import { EEthnicGroup } from 'src/shared/enums/ethnic-group.enum';

@Entity()
@Index('idx_applicant_email', ['email'])
@Index('idx_applicant_invitation_token', ['invitationToken'])
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

  @ManyToOne(() => Country, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'country_of_birth_id' })
  countryOfBirth?: Relation<Country> | null;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_of_birth_id' })
  departmentOfBirth?: Relation<Department> | null;

  @ManyToOne(() => City, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'city_of_birth_id' })
  cityOfBirth?: Relation<City> | null;

  @ManyToOne(() => Country, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'country_of_residence_id' })
  countryOfResidence?: Relation<Country> | null;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_of_residence_id' })
  departmentOfResidence?: Relation<Department> | null;

  @ManyToOne(() => City, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'city_of_residence_id' })
  cityOfResidence?: Relation<City> | null;

  @Column({
    nullable: true,
    type: 'enum',
    name: 'sex',
    enum: ESex,
  })
  sex: ESex | null;

  @Column({
    nullable: true,
    type: 'enum',
    name: 'genre',
    enum: EGender,
  })
  genre: EGender | null;

  @Column({
    nullable: true,
    type: 'enum',
    name: 'sexual_orientation',
    enum: ESexualOrientation,
  })
  sexualOrientation: ESexualOrientation | null;

  @Column({
    nullable: true,
    type: 'enum',
    name: 'ethnic_group',
    enum: EEthnicGroup,
  })
  ethnicGroup: EEthnicGroup | null;

  @Column({
    nullable: true,
    type: 'int',
    name: 'salary_aspiration',
  })
  salaryAspiration: number | null;

  @Column({
    type: 'varchar',
    name: 'identification',
    length: 60,
    nullable: true,
  })
  identification: string;

  /* @Column({
  nullable: true,
  type: 'enum',
  name: 'identification_type',
  enum: EIdentificationType,
  })
  identificationType: EIdentificationType; */

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

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'invitation_token',
    length: 255,
  })
  invitationToken: string | null;

  @Column({
    nullable: true,
    type: 'timestamp',
    name: 'invitation_token_expires',
  })
  invitationTokenExpires: Date | null;

  @OneToMany(() => Resume, (resume) => resume.applicant)
  resumes: Relation<Resume>[];
}
