import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Program } from '../program/program.entity';

@Entity()
export class CostType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  name: string;

  @Column({ nullable: true, unique: true })
  alias: string;

  @OneToMany(() => Program, program => program.costType)
  programs: Program[];
} 