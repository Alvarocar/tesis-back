import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
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
  about_me: string;

  @Column({
    type: 'date',
    name: 'create_date',
  })
  createDate: Date;

  @Column({
    type: 'date',
    name: 'modification_date',
  })
  modificationDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    const current = new Date();
    this.createDate = current;
    this.modificationDate = current;
  }

  @BeforeUpdate()
  updateDateOnUpdate() {
    const current = new Date();
    this.modificationDate = current;
  }

  @OneToMany(() => ResumeLanguage, resumeToLanguage => resumeToLanguage.resume, { onDelete: 'CASCADE' })
  resumeLanguage: Relation<ResumeLanguage>[];

  @OneToMany(() => Education, education => education.resume, { onDelete: 'CASCADE' })
  educations: Relation<Education>[];

  @OneToMany(() => Experience, experience => experience.resume, { onDelete: 'CASCADE' })
  experiences: Relation<Experience>[];

  @ManyToOne(() => Applicant, applicant => applicant.resumes, { onDelete: 'CASCADE' })
  applicant: Relation<Applicant>;

  @OneToMany(() => PersonalReference, personal => personal.resume, { onDelete: 'CASCADE' })
  personal_references: Relation<PersonalReference>[];

  @OneToMany(() => LaboralReference, laboral => laboral.resume, { onDelete: 'CASCADE' })
  laboral_references: Relation<LaboralReference>[];

  @OneToMany(() => Skill, skills => skills.resume, { onDelete: 'CASCADE' })
  skills: Relation<Skill>[];

  @OneToMany(() => Applicant, applicant => applicant.resumes, { onDelete: 'CASCADE' })
  applications: Relation<Applicant>[];
}
