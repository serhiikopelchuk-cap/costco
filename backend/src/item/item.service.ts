import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { Cost } from '../cost/cost.entity';
import { Category } from '../category/category.entity';

export interface ClonedItemResponse {
  item: Item;
  categoryId: number;
  costIds: number[];
}

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Cost)
    private costRepository: Repository<Cost>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Item[]> {
    return await this.itemRepository.find({ relations: ['costs'] });
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id }, relations: ['costs', 'category'] });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  async create(itemData: Partial<Item> & { categoryId: number }): Promise<Item> {
    const { categoryId, ...itemDetails } = itemData;
    
    // Find the category
    const category = await this.categoryRepository.findOne({ 
      where: { id: categoryId } 
    });
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Validate costs
    this.validateCosts(itemDetails.costs);

    // Create the item with category
    const item = this.itemRepository.create({
      ...itemDetails,
      category
    });

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

  async clone(id: number, categoryId?: number): Promise<ClonedItemResponse> {
    const item = await this.findOne(id);

    // Use the provided category ID or the original item's category
    const clonedCategory = categoryId ? { id: categoryId } : item.category;

    // Create a new item with the specified category
    const clonedItem = this.itemRepository.create({
      ...item,
      id: undefined, // Ensure a new ID is generated
      category: clonedCategory, // Use the specified category
      costs: [] // Initialize with an empty array
    });

    // Save the cloned item first to get its ID
    const savedItem = await this.itemRepository.save(clonedItem);

    // Clone the costs in the same sequence and associate them with the new item
    const clonedCosts = item.costs.map(cost => {
      const clonedCost = new Cost();
      clonedCost.value = cost.value;
      clonedCost.item = savedItem; // Associate with the new item
      return clonedCost;
    });

    // Save the cloned costs
    await this.costRepository.save(clonedCosts);

    // Reload the saved item to include the costs
    const completeItem = await this.itemRepository.findOne({
      where: { id: savedItem.id },
      relations: ['costs', 'category']
    });

    // Extract the IDs of the costs
    const costIds = completeItem.costs.map(cost => cost.id);

    return {
      item: completeItem,
      categoryId: completeItem.category.id,
      costIds: costIds
    };
  }

  private validateCosts(costs: Cost[]) {
    if (costs.length !== 13) {
      throw new BadRequestException('An item must have exactly 13 cost entries.');
    }
    for (const cost of costs) {
      if (cost.value < 0) {
        throw new BadRequestException('Cost amount cannot be negative.');
      }
    }
  }
} 