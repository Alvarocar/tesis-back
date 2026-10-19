import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Resume } from './resume.entity';
import { Country } from 'src/shared/db/entities/country.entity';
import { Department } from 'src/shared/db/entities/department.entity';
import { City } from 'src/shared/db/entities/city.entity';

@Entity()
export class Experience {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'rol',
  })
  rol: string;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'company',
  })
  company: string;

  @Column({
    type: 'date',
    name: 'start_date',
  })
  startDate: Date;

  @Column({
    type: 'date',
    name: 'end_date',
    nullable: true,
  })
  endDate?: Date | null;

  @Column({
    type: 'boolean',
    name: 'keep_working',
    nullable: true,
  })
  keepWorking?: boolean;

  @Column({
    type: 'text',
    name: 'description',
  })
  description: string;

  @ManyToOne(() => Country, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'country_id' })
  country?: Relation<Country> | null;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department?: Relation<Department> | null;

  @ManyToOne(() => City, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'city_id' })
  city?: Relation<City> | null;

  @ManyToOne(() => Resume, (resume) => resume.experiences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resume_id' })
  resume: Relation<Resume>;
}
