import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Resume } from './resume.model';
import { Language } from "./language.model";

@Entity()
export class ResumeToLenguage {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number

  @Column({
    type: 'smallint'
  })
  leguage_level: number

  @ManyToOne(() => Resume, (resume)=>resume.resumeToLenguage)
  resume: Resume

  @ManyToOne(() => Language, (language)=>language.resumeToLenguage)
  language: Language
}