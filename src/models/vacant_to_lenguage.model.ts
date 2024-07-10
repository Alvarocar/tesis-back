import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Language } from "./language.model";
import { Vacant } from './vacant.model';

@Entity()
export class VacantToLenguage {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number

  @Column({
    type: 'smallint'
  })
  leguage_level: number

  @ManyToOne(() => Vacant, (vacant)=>vacant.VacantToLenguage)
  vacant: Vacant

  @ManyToOne(() => Language, (language)=>language.VacantToLenguage)
  language: Language
}