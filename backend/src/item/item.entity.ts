import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, BeforeInsert } from 'typeorm';
import { Category } from '../category/category.entity';
import { Cost } from '../cost/cost.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Cost, cost => cost.item, { cascade: true, nullable: true })
  costs: Cost[];

  @ManyToOne(() => Category, category => category.items, { nullable: true, onDelete: 'CASCADE' })
  category: Category;

  @BeforeInsert()
  initializeCosts() {
    if (!this.costs || this.costs.length !== 13) {
      this.costs = Array.from({ length: 13 }, () => {
        const cost = new Cost();
        cost.value = 0; // Default amount
        return cost;
      });
    }
  }
} 