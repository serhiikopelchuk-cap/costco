import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Item } from '../item/item.entity';

@Entity()
export class Cost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', default: 0 })
  value: number;

  @ManyToOne(() => Item, item => item.costs, { onDelete: 'CASCADE' })
  item: Item;
} 