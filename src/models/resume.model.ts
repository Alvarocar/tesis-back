import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ResumeToLenguage } from "./resume_to_lenguage.model";
import { Education } from "./education.model";
import { Experience } from "./experience.model";

@Entity()
export class Resume {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number

  @Column({
    type: 'varchar',
    length: 60,
  })
  knowledge: string

  @Column({
    type: 'varchar',
    length: 60,
  })
  contact_info: string

  @Column({
    type: 'smallint',
  })
  language_level: number

  @Column({
    type: 'text',
  })
  about_me: string
  @OneToMany(()=> ResumeToLenguage, (resumeToLenguage)=>resumeToLenguage.resume)
  resumeToLenguage: ResumeToLenguage

  @OneToMany(()=> Education, (education)=>education.resume_id)
  educations: Education[]

  @OneToMany(()=> Experience, (experience)=>experience.resume_id)
  experiences: Experience[]
  
}