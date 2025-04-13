import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Vacant } from './vacant.model';

@Entity({
  name: 'contract',
})
export class Contract {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 60,
  })
  name: string;

  @OneToMany(() => Vacant, vacant => vacant.contract)
  vacancies: Relation<Vacant>[];
}
