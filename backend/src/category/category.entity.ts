import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Item } from '../item/item.entity';

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
  @ApiProperty({ example: 'Note1', description: 'The node associated with the category' })
  note: string;

  @OneToMany(() => Item, item => item.category)
  items: Item[];
} 