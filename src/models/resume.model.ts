import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm';
import { ResumeLanguage } from './resume_to_language.model';
import { Education } from './education.model';
import { Experience } from './experience.model';
import { Applicant } from './applicant.model';
import { PersonalReference } from './personal_reference.model';
import { LaboralReference } from './laboral_reference.model';
import { Skill } from './skill.model';

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

  @OneToMany(() => ResumeLanguage, resumeToLanguage => resumeToLanguage.resume, { onDelete: 'CASCADE' })
  resumeLanguage: Relation<ResumeLanguage>[];

  @OneToMany(() => Education, education => education.resume, { onDelete: 'CASCADE' })
  educations: Relation<Education>[];

  @OneToMany(() => Experience, experience => experience.resume, { onDelete: 'CASCADE' })
  experiences: Relation<Experience>[];

  @ManyToOne(() => Applicant, applicant => applicant.resumes)
  @JoinColumn({
    name: 'applicant_id',
    referencedColumnName: 'id',
  })
  applicant: Relation<Applicant>;

  @OneToMany(() => PersonalReference, personal => personal.resume, { onDelete: 'CASCADE' })
  personal_references: Relation<PersonalReference>[];

  @OneToMany(() => LaboralReference, laboral => laboral.resume, { onDelete: 'CASCADE' })
  laboral_references: Relation<LaboralReference>[];

  @OneToMany(() => Skill, skills => skills.resume, { onDelete: 'CASCADE' })
  skills: Relation<Skill>[];

  @OneToMany(() => Applicant, applicant => applicant.resumes, { onDelete: 'CASCADE' })
  applications: Relation<Applicant>[];

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  public deletedAt?: Date;
}
