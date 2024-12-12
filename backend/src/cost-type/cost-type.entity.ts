import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { Program } from '../program/program.entity';
import { Category } from '../category/category.entity';

@Entity()
export class CostType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  name: string;

  @Column({ nullable: true, unique: true })
  alias: string;

  // @OneToMany(() => Program, program => program.costType, { cascade: true, nullable: true })
  // programs: Program[];

  @OneToMany(() => Category, category => category.costType)
  categories: Category[];
} 