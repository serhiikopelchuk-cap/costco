import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Category } from '../category/category.entity';
import { Cost } from '../cost/cost.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Cost, cost => cost.item, { cascade: ['remove'], nullable: true })
  costs: Cost[];

  @ManyToOne(() => Category, category => category.items, { nullable: true })
  category: Category;
} 