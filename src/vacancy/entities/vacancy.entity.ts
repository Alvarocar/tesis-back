import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, type Relation, UpdateDateColumn } from 'typeorm';
import { VacancyJobType } from '../enums/vacancy-job-type.enum';
import { Skill } from 'src/shared/entities/skill';
import { VacancyLanguage } from './vacancyLanguage.entity';
import { Employee } from 'src/employee/entities/employee.entity';
import { Application } from 'src/application/entities/application.entity';

@Entity({
  name: 'vacancy',
})
export class Vacancy {
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
    enum: VacancyJobType,
    name: 'job_type',
  })
  jobType: VacancyJobType;

  @ManyToMany(() => Skill, { cascade: false })
  @JoinTable({ name: 'vacancy_skill' })
  skills: Relation<Skill>[];

  @OneToMany(() => VacancyLanguage, vacancyLanguage => vacancyLanguage.vacant)
  vacancyLanguage: Relation<VacancyLanguage>[];

  @OneToMany(() => Application, application => application.vacancy)
  applications: Relation<Application>[];

  @ManyToOne(() => Employee, employee => employee.vacancies)
  @JoinColumn({ name: 'employee_id', referencedColumnName: 'id' })
  employee: Relation<Employee>;
}
