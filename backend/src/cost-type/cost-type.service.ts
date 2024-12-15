import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CostType, CreateCostTypeDto } from './cost-type.entity';

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

  create(createDto: CreateCostTypeDto): Promise<CostType> {
    const costType = this.costTypeRepository.create(createDto);
    return this.costTypeRepository.save(costType);
  }

  async createMultiple(createDtos: CreateCostTypeDto[]): Promise<CostType[]> {
    const costTypes = createDtos.map(dto => this.costTypeRepository.create(dto));
    return this.costTypeRepository.save(costTypes);
  }

  async update(id: number, updateDto: CreateCostTypeDto): Promise<CostType> {
    await this.costTypeRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.costTypeRepository.delete(id);
  }

  // TODO: To be removed
  async findByAlias(alias: string): Promise<CostType> {
    const costType = await this.costTypeRepository
      .createQueryBuilder('costType')
      .leftJoinAndSelect('costType.programs', 'programs')
      .leftJoinAndSelect('programs.projects', 'projects')
      .leftJoinAndSelect('projects.categories', 'categories')
      .leftJoinAndSelect('categories.items', 'items')
      .leftJoinAndSelect('categories.cloudProviders', 'cloudProviders')
      .leftJoinAndSelect('items.costs', 'costs')
      .where('costType.alias = :alias', { alias })
      .orderBy('costs.id', 'ASC')
      .getOne();

    if (!costType) {
      throw new NotFoundException(`CostType with alias ${alias} not found`);
    }

    return costType;
  }
} 