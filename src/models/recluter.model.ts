import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vacant } from './vacant.model';

@Entity({
  name: 'recluter',
})
export class Recruiter {
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

  @ManyToOne(() => Vacant, vacant => vacant.recruiter)
  vacants: Vacant[];
}
