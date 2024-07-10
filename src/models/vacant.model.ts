import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { VacantToLenguage } from "./vacant_to_lenguage.model";

@Entity()
export class Vacant {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number

  @Column({
    type: 'varchar',
    length: 60,
  })
  about: string

  @Column({
    type: 'smallint'
  })
  experience: number

  @Column({
    type: 'varchar',
    length: 60,
  })
  language: string

  @Column({
    type: 'date',
  })
  creation: Date

  @Column({
    type: 'date',
  })
  modification: Date

  @Column({
    type: 'int',
  })
  salary_offer: number

  @OneToMany(()=> VacantToLenguage, (vacantToLenguage)=>vacantToLenguage.vacant)
  VacantToLenguage: VacantToLenguage


}