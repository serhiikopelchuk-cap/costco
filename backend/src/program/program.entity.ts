import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
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

  @OneToMany(() => Project, project => project.program, { cascade: true })
  projects: Project[];

  @ManyToOne(() => CostType, costType => costType.programs)
  costType: CostType;
} 