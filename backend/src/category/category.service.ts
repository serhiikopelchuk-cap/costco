import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Item } from '../item/item.entity';
import { Cost } from '../cost/cost.entity';
import { ItemService } from '../item/item.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Cost)
    private costRepository: Repository<Cost>,
    private itemService: ItemService
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({ relations: ['items', 'items.costs'] });
  }

  async findOne(id: number): Promise<Category> {
    return await this.categoryRepository.findOne({ where: { id }, relations: ['items', 'items.costs'] });
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    // Create and save the category first
    const category = new Category();
    category.name = categoryData.name;
    category.description = categoryData.description;
    category.note = categoryData.note;

    // Assign the category to a project if project.id exists
    if (categoryData.project && categoryData.project.id) {
      category.project = { id: categoryData.project.id };
    }

    const savedCategory = await this.categoryRepository.save(category);

    // Process and save each item
    if (categoryData.items) {
      const items = await Promise.all(
        categoryData.items.map(async (itemData) => {
          const item = new Item();
          item.name = itemData.name;
          item.category = savedCategory;

          // Save the item first to get its ID
          const savedItem = await this.itemRepository.save(item);

          // Process and save each cost for the item
          if (itemData.costs) {
            const costs = await Promise.all(
              itemData.costs.map(async (costValue: any) => {
                if (costValue !== null && costValue !== undefined) {
                  const cost = new Cost();
                  cost.value = costValue;
                  cost.item = savedItem; // Use the saved item
                  return this.costRepository.save(cost);
                }
                throw new Error('Cost value cannot be null or undefined');
              }),
            );
            savedItem.costs = costs;
          } else {
            savedItem.costs = [];
          }

          return savedItem;
        }),
      );

      // Assign the saved items to the category
      savedCategory.items = items;
    }

    return await this.categoryRepository.findOne({ where: { id: savedCategory.id }, relations: ['items', 'items.costs', 'project'] });
  }

  async update(id: number, categoryData: Partial<Category>): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id }, relations: ['items', 'items.costs'] });
    if (!category) throw new Error('Category not found');

    category.name = categoryData.name || category.name;
    category.description = categoryData.description || category.description;
    category.note = categoryData.note || category.note;

    if (categoryData.items) {
      for (const itemData of categoryData.items) {
        const item = category.items.find(i => i.id === itemData.id);
        if (item) {
          item.name = itemData.name || item.name;
          if (itemData.costs) {
            await this.costRepository.delete({ item: { id: item.id } });
            item.costs = await Promise.all(
              itemData.costs.map(async (costValue: any) => {
                const cost = new Cost();
                cost.value = costValue.value;
                cost.item = item;
                return this.costRepository.save(cost);
              }),
            );
          }
        }
      }
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }

  async clone(id: number, projectId?: number): Promise<Category> {
    // Include project in relations when fetching the category
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['items', 'items.costs', 'project']
    });
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // console.log('Category:', category);
    // Create a new category with the specified project or original project
    const clonedCategory = this.categoryRepository.create({
      name: `${category.name} (Copy)`,
      description: category.description,
      note: category.note,
      project: projectId ? { id: projectId } : category.project,
      items: []
    });

    // Save the cloned category first to get its ID
    const savedCategory = await this.categoryRepository.save(clonedCategory);

    // Clone each item using the ItemService's clone method
    const clonedItems = await Promise.all(
      category.items.map(async (item) => {
        const clonedItemResponse = await this.itemService.clone(item.id, savedCategory.id);
        return clonedItemResponse.item;
      })
    );

    // Assign the cloned items to the cloned category
    savedCategory.items = clonedItems;

    // Return the complete cloned category with items and costs
    return await this.categoryRepository.findOne({
      where: { id: savedCategory.id },
      relations: ['items', 'items.costs', 'project']
    });
  }
} 