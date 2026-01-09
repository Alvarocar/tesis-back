import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'skill' })
export class Skill {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
  })
  name: string;
}
