import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../category/category.entity';

@Entity()
export class CostType {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Direct Costs', description: 'Name of the cost type' })
  @Column({ unique: true, nullable: true })
  name: string;

  @ApiProperty({ example: 'direct_costs', description: 'Alias for the cost type' })
  @Column({ nullable: true, unique: true })
  alias: string;

  @OneToMany(() => Category, category => category.costType)
  categories: Category[];
}

// DTOs for request validation and Swagger documentation
export class CreateCostTypeDto {
  @ApiProperty({ example: 'Direct Costs', description: 'Name of the cost type' })
  name: string;

  @ApiProperty({ example: 'direct_costs', description: 'Alias for the cost type' })
  alias: string;
}

export class CreateMultipleCostTypesDto {
  @ApiProperty({
    example: [
      { name: 'Direct Costs', alias: 'direct_costs' },
      { name: 'Indirect Costs', alias: 'indirect_costs' }
    ],
    description: 'Array of cost types',
    type: [CreateCostTypeDto]
  })
  costTypes: CreateCostTypeDto[];
} 