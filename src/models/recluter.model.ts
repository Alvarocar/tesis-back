import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Vacant } from './vacant.model';
import { Position } from './position.model';
import { Contract } from './contract.model';

@Entity({
  name: 'employee',
})
export class Recruiter {
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

  @ManyToOne(() => Position, position => position.recruiters)
  @JoinColumn({ name: 'position_id', referencedColumnName: 'id' })
  position: Relation<Position>;

  @ManyToOne(() => Contract, contract => contract.recruiters)
  @JoinColumn({ name: 'contract_id', referencedColumnName: 'id' })
  contract: Relation<Contract>;

  @OneToMany(() => Vacant, vacant => vacant.recruiter)
  vacancies: Relation<Vacant>[];
}
