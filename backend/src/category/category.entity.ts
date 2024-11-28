import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Item } from '../item/item.entity';
import { Project } from '../project/project.entity';
import { Period } from '../period/period.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'The unique identifier of the category' })
  id: number;

  @Column()
  @ApiProperty({ example: 'Compute Costs', description: 'The name of the category' })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Costs associated with virtual machines', description: 'A brief description of the category' })
  description: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Note1', description: 'The note associated with the category' })
  note: string;

  @Column('simple-array', { nullable: true })
  @ApiProperty({ example: ['AWS', 'Azure'], description: 'The cloud providers associated with the category' })
  cloudProvider: string[];

  @OneToMany(() => Item, item => item.category, { cascade: true, nullable: true })
  @ApiProperty({ type: () => [Item], description: 'The items associated with the category' })
  items: Item[];

  @ManyToOne(() => Project, project => project.categories)
  project: Project;

  // @ManyToMany(() => Period, period => period.categories)
  // @JoinTable()
  // @ApiProperty({ type: () => [Period], description: 'The periods associated with the category' })
  // periods: Period[];
} 