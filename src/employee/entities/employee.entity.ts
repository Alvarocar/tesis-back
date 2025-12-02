import { Vacancy } from 'src/vacancy/entities/vacancy.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';

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
  })
  password: string;

  @Column({
    type: 'boolean',
    name: 'is_active',
    default: true,
  })
  isActive: boolean;

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

  @OneToMany(() => Vacancy, vacant => vacant.employee)
  vacancies: Relation<Vacancy>[];
}
