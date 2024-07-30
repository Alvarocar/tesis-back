import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ResumeToLanguage } from './resume_to_language.model';
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
  })
  about_me: string;

  @Column({
    type: 'date',
  })
  create_date: Date;

  @Column({
    type: 'date',
  })
  modification_date: Date;

  @BeforeInsert()
  updateDateCreation() {
    const current = new Date();
    this.create_date = current;
    this.modification_date = current;
  }

  @BeforeUpdate()
  updateDateOnUpdate() {
    const current = new Date();
    this.modification_date = current;
  }

  @OneToMany(() => ResumeToLanguage, resumeToLanguage => resumeToLanguage.resume)
  resumeToLanguage: ResumeToLanguage[];

  @OneToMany(() => Education, education => education.resume)
  educations: Education[];

  @OneToMany(() => Experience, experience => experience.resume)
  experiences: Experience[];

  @ManyToOne(() => Applicant, applicant => applicant.resumes)
  applicant: Applicant;

  @OneToMany(() => PersonalReference, personal => personal.resume)
  personal_references: PersonalReference[];

  @OneToMany(() => LaboralReference, laboral => laboral.resume)
  laboral_references: LaboralReference[];

  @OneToMany(() => Skill, skills => skills.resume)
  skills: Skill[];
}
