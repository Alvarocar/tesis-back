import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Applicant } from 'src/applicant/entities/applicant.entity';
import { Skill } from 'src/shared/entities/skill.entity';
import { PersonalReference } from './personal-reference.entity';
import { LaboralReference } from './laboral-reference.entity';
import { ResumeLanguage } from './resume-language.entity';
import { Experience } from './experience.entity';
import { Education } from './education.entity';

@Entity()
export class Resume {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
  })
  title: string;

  @Column({
    type: 'int',
  })
  experience_years: number;

  @Column({
    type: 'text',
    name: 'description',
  })
  aboutMe: string;

  @CreateDateColumn({
    type: 'date',
    name: 'create_date',
  })
  createDate: Date;

  @UpdateDateColumn({
    type: 'date',
    name: 'modification_date',
  })
  modificationDate: Date;

  @OneToMany(
    () => ResumeLanguage,
    (resumeToLanguage) => resumeToLanguage.resume,
    { onDelete: 'CASCADE' },
  )
  resumeLanguage: Relation<ResumeLanguage>[];

  @OneToMany(() => Education, (education) => education.resume, {
    onDelete: 'CASCADE',
  })
  educations: Relation<Education>[];

  @OneToMany(() => Experience, (experience) => experience.resume, {
    onDelete: 'CASCADE',
  })
  experiences: Relation<Experience>[];

  @ManyToOne(() => Applicant, (applicant) => applicant.resumes)
  @JoinColumn({
    name: 'applicant_id',
    referencedColumnName: 'id',
  })
  applicant: Relation<Applicant>;

  @OneToMany(() => PersonalReference, (personal) => personal.resume, {
    onDelete: 'CASCADE',
  })
  personal_references: Relation<PersonalReference>[];

  @OneToMany(() => LaboralReference, (laboral) => laboral.resume, {
    onDelete: 'CASCADE',
  })
  laboral_references: Relation<LaboralReference>[];

  @ManyToMany(() => Skill, { cascade: false })
  @JoinTable({ name: 'resume_skill' })
  skills: Relation<Skill>[];

  @OneToMany(() => Applicant, (applicant) => applicant.resumes, {
    onDelete: 'CASCADE',
  })
  applications: Relation<Applicant>[];

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  public deletedAt?: Date;
}
