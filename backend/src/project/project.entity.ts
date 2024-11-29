import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Category } from '../category/category.entity';
import { Program } from '../program/program.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;
  
  @ManyToOne(() => Program, program => program.projects, { onDelete: 'CASCADE', nullable: true })
  program?: Program;
  
  @OneToMany(() => Category, category => category.project, { cascade: true, onDelete: 'CASCADE', nullable: true })
  categories?: Category[];
} 