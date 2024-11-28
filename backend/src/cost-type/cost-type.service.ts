import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CostType } from './cost-type.entity';

@Injectable()
export class CostTypeService {
  constructor(
    @InjectRepository(CostType)
    private costTypeRepository: Repository<CostType>,
  ) {}

  findAll(): Promise<CostType[]> {
    return this.costTypeRepository.find();
  }

  async findOne(id: number): Promise<CostType> {
    const costType = await this.costTypeRepository.findOne({ where: { id } });
    if (!costType) {
      throw new NotFoundException(`CostType with ID ${id} not found`);
    }
    return costType;
  }

  create(costType: CostType): Promise<CostType> {
    return this.costTypeRepository.save(costType);
  }

  async update(id: number, costType: CostType): Promise<CostType> {
    await this.costTypeRepository.update(id, costType);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.costTypeRepository.delete(id);
  }

  async findByAlias(alias: string): Promise<CostType> {
    const costType = await this.costTypeRepository.findOne({
      where: { alias },
      relations: [
        'programs',
        'programs.projects',
        'programs.projects.categories',
        'programs.projects.categories.items',
        'programs.projects.categories.items.costs'
      ]
    });

    if (!costType) {
      throw new NotFoundException(`CostType with alias ${alias} not found`);
    }

    return costType;
  }
} 