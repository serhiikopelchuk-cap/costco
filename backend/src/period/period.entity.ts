import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
// import { Category } from '../category/category.entity';

@Entity()
export class Period {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'The unique identifier of the period' })
  id: number;

  @Column()
  @ApiProperty({ example: 'Period 1', description: 'The name of the period' })
  name: string;

  @Column()
  @ApiProperty({ example: 1, description: 'The number of the period' })
  number: number;

  @Column({ nullable: true })
  @ApiProperty({ example: 'January', description: 'The associated month of the period' })
  month: string;

  @Column({ default: false })
  @ApiProperty({ example: false, description: 'Whether the period is frozen' })
  isFrozen: boolean;

//   @ManyToMany(() => Category, category => category.periods, { nullable: true })
//   @ApiProperty({ type: () => [Category], description: 'The categories associated with the period', required: false })
//   categories: Category[];
} 