import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VacantToLanguage } from './vacant_to_language.model';
import { Application } from './application.model';
import { VacantJobType } from '@/enums/vacant.enum';
import { Recruiter } from './recluter.model';
import { Contract } from './contract.model';
import { Position } from './position.model';
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

  @ManyToOne(() => Contract, contract => contract.vacancies)
  @JoinColumn({ name: 'contract_id', referencedColumnName: 'id' })
  contract: typeof Contract;

  @ManyToOne(() => Position, position => position.vacancies)
  @JoinColumn({ name: 'position_id', referencedColumnName: 'id' })
  position: typeof Position;

  @OneToMany(() => VacancySkill, skill => skill.vacancy)
  @JoinColumn({ name: 'vacancy_skill_id', referencedColumnName: 'id' })
  skills: (typeof VacancySkill)[];

  @OneToMany(() => VacantToLanguage, vacantToLanguage => vacantToLanguage.vacant)
  VacantToLanguage: VacantToLanguage[];

  // eslint-disable-next-line prettier/prettier
  @OneToMany(() => Application, (application) => application.vacant)
  applications: Application[];

  @OneToMany(() => Recruiter, recruiter => recruiter.vacants)
  recruiters: Recruiter[];
}
