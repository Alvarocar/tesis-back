import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Recluter {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 60,
  })
  rol: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  about_me: string;

  @Column({
    type: 'varchar',
    length: 60,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 60,
  })
  password: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  is_active: boolean;

  @Column({
    type: 'date',
  })
  creation_date: Date;

  @Column({
    type: 'date',
  })
  modification_date: Date;
}
