import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Project } from '../project/project.entity';
import { CostType } from '../cost-type/cost-type.entity';

@Entity()
export class Program {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Project, project => project.program, { cascade: true, onDelete: 'CASCADE' })
  projects: Project[];

  @Column('jsonb', { nullable: true, default: {} })
  settings: Record<string, any>;
} 