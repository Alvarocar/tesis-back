import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm';
import { VacantToLanguage } from './vacant_to_language.model';
import { Application } from './application.model';
import { VacantJobType } from '@/enums/vacant.enum';
import { Recruiter } from './recluter.model';
import { VacancySkill } from './vacancySkill.model';

@Entity({
  name: 'vacancy',
})
export class Vacant {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'title',
  })
  title: string;

  @Column({
    type: 'text',
    name: 'description',
  })
  description: string;

  @Column({
    type: 'float',
    name: 'experience_years',
    nullable: true,
  })
  experienceYears: number;

  @CreateDateColumn({
    type: 'date',
    name: 'creation_date',
  })
  creationDate: Date;

  @UpdateDateColumn({
    type: 'date',
    name: 'modification_date',
  })
  modificationDate: Date;

  @Column({
    type: 'int',
    name: 'salary_offer',
    nullable: true,
  })
  salaryOffer: number;

  @Column({
    type: 'enum',
    enum: VacantJobType,
    name: 'job_type',
  })
  jobType: VacantJobType;

  @OneToMany(() => VacancySkill, skill => skill.vacancy)
  @JoinColumn({ name: 'vacancy_skill_id', referencedColumnName: 'id' })
  skills: Relation<VacancySkill>[];

  @OneToMany(() => VacantToLanguage, vacantToLanguage => vacantToLanguage.vacant)
  VacantToLanguage: Relation<VacantToLanguage>[];

  @OneToMany(() => Application, application => application.vacant)
  applications: Relation<Application>[];

  @ManyToOne(() => Recruiter, recruiter => recruiter.vacancies)
  @JoinColumn({ name: 'employee_id', referencedColumnName: 'id' })
  recruiter: Relation<Recruiter>;
}
