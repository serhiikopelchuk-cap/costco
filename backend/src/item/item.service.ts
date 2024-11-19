import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { Cost } from '../cost/cost.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Cost)
    private costRepository: Repository<Cost>,
  ) {}

  async findAll(): Promise<Item[]> {
    return await this.itemRepository.find({ relations: ['costs'] });
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id }, relations: ['costs'] });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  async create(itemData: Partial<Item>): Promise<Item> {
    if (!itemData.costs || itemData.costs.length !== 13) {
      throw new BadRequestException('An item must have exactly 13 costs.');
    }
    console.log("costs", itemData.costs)
    const item = this.itemRepository.create(itemData);
    return await this.itemRepository.save(item);
  }

  async update(id: number, itemData: Partial<Item>): Promise<Item> {
    if (itemData.costs && itemData.costs.length !== 13) {
      throw new BadRequestException('An item must have exactly 13 costs.');
    }
    const item = await this.findOne(id);
    Object.assign(item, itemData);
    return await this.itemRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.costRepository.delete({ item: { id: item.id } });
    await this.itemRepository.remove(item);
  }
} 