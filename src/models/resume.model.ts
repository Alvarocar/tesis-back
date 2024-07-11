import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ResumeToLanguage } from './resume_to_language.model';
import { Education } from './education.model';
import { Experience } from './experience.model';
import { Applicant } from './applicant.model';

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
  knowledge: string;

  @Column({
    type: 'varchar',
    length: 60,
  })
  contact_info: string;

  @Column({
    type: 'text',
  })
  about_me: string;
  @OneToMany(() => ResumeToLanguage, resumeToLanguage => resumeToLanguage.resume)
  resumeToLanguage: ResumeToLanguage;

  @OneToMany(() => Education, education => education.resume)
  educations: Education[];

  @OneToMany(() => Experience, experience => experience.resume)
  experiences: Experience[];

  @ManyToOne(() => Applicant, applicant => applicant.resumes)
  applicant: Applicant;
}
