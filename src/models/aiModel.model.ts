import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Application } from './application.model';

@Entity({
  name: 'ai_model',
})
export class AIModel {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'name',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 60,
    name: 'version',
  })
  version: string;

  @OneToMany(() => Application, application => application.aiModel)
  applications: Relation<Application>[];
}
