import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VacantToLanguage } from './vacant_to_language.model';
import { Application } from './application.model';
import { VacantJobType } from '@/enums/vacant.enum';

@Entity()
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
    name: 'jobType',
  })
  jobType: VacantJobType;

  @OneToMany(() => VacantToLanguage, vacantToLanguage => vacantToLanguage.vacant)
  VacantToLanguage: VacantToLanguage[];

  @OneToMany(() => Application, application => application.vacant)
  applications: Application[];
}
