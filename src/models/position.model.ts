import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Recruiter } from './recluter.model';

@Entity({
  name: 'position',
})
export class Position {
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

  @OneToMany(() => Recruiter, recruiter => recruiter.position)
  recruiters: Relation<Recruiter>[];
}
