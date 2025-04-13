import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Recruiter } from './recluter.model';

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

  @OneToMany(() => Recruiter, recruiter => recruiter.contract)
  recruiters: Relation<Recruiter>[];
}
