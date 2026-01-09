import type { Relation } from 'typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'company',
})
export class Company {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    name: 'name',
    length: 100,
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'address',
    length: 200,
    nullable: true,
  })
  address: string;

  @Column({
    type: 'varchar',
    name: 'phone',
    length: 20,
    nullable: true,
  })
  phone: string;

  @Column({
    type: 'varchar',
    name: 'nit',
    length: 20,
    unique: true,
  })
  nit: string;

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

  @OneToMany(() => Employee, (employee) => employee.company)
  employees: Relation<Employee>[];
}
