import type { Relation } from 'typeorm';
import { Vacancy } from 'src/vacancy/entities/vacancy.entity';
import { Company } from 'src/company/entities/company.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmployeeRole } from '../enums/employee-role.enum';

@Entity({
  name: 'employee',
})
export class Employee {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    name: 'first_name',
    length: 60,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    name: 'last_name',
    length: 60,
    nullable: true,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    name: 'email',
    length: 60,
  })
  email: string;

  @Column({
    type: 'varchar',
    name: 'password',
    length: 60,
    nullable: true,
  })
  password: string;

  @Column({
    type: 'varchar',
    name: 'invitation_token',
    length: 255,
    nullable: true,
  })
  invitationToken: string | null;

  @Column({
    type: 'timestamp',
    name: 'invitation_token_expires',
    nullable: true,
  })
  invitationTokenExpires: Date | null;

  @Column({
    type: 'boolean',
    name: 'is_active',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    name: 'role',
    default: EmployeeRole.Employee,
  })
  role: EmployeeRole;

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

  @ManyToOne(() => Company, (company) => company.employees, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company: Relation<Company>;

  @Column({
    type: 'int',
    name: 'company_id',
  })
  companyId: number;

  @OneToMany(() => Vacancy, (vacant) => vacant.employee)
  vacancies: Relation<Vacancy>[];

  @BeforeInsert()
  setCreationDate() {
    this.creationDate = new Date();
    this.modificationDate = new Date();
  }

  @BeforeUpdate()
  setModificationDate() {
    this.modificationDate = new Date();
  }
}
