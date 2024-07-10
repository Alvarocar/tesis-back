import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ResumeToLenguage } from "./resume_to_lenguage.model";
import { VacantToLenguage } from './vacant_to_lenguage.model';

@Entity()
export class Language {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number

  @Column({
    type: 'varchar',
    length: 60,
  })
  name: string
  
  @OneToMany(()=> ResumeToLenguage, (resumeToLenguage)=>resumeToLenguage.resume)
  resumeToLenguage: ResumeToLenguage

  @OneToMany(()=> VacantToLenguage, (vacantToLenguage)=>vacantToLenguage.vacant)
  VacantToLenguage: VacantToLenguage


}