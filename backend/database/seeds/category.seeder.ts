import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Category } from 'src/category/category.entity';
import { Item } from 'src/item/item.entity';
import { Cost } from 'src/cost/cost.entity';
import { Program } from 'src/program/program.entity';
import { Project } from 'src/project/project.entity';

export class CategorySeeder implements Seeder {
  async run(
    dataSource: DataSource, 
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    const categoryRepository = dataSource.getRepository(Category);
    const itemRepository = dataSource.getRepository(Item);
    const costRepository = dataSource.getRepository(Cost);
    const programRepository = dataSource.getRepository(Program);
    const projectRepository = dataSource.getRepository(Project);

    // Create and save a Program
    const program = programRepository.create({
      name: 'Default Program',
      description: 'This is a default program for seeding purposes',
    });
    const savedProgram = await programRepository.save(program);
    console.log(`Saved Program:`, savedProgram);

    // Create and save a Project associated with the Program
    const project = projectRepository.create({
      name: 'Default Project',
      description: 'This is a default project for seeding purposes',
      program: savedProgram, // Associate with the saved Program
    });
    const savedProject = await projectRepository.save(project);
    console.log(`Saved Project:`, savedProject);
    const data = this.readDirectCostJson();

    for (const categoryData of data.categories) {
      console.log(`Adding category:`, categoryData.name);
      const category = categoryRepository.create({
        name: categoryData.name,
        description: categoryData.description,
        note: categoryData.note,
        cloudProvider: categoryData.cloudProvider,
        project: savedProject, // Associate with the saved Project
      });

      // Save the category first to get its ID
      const savedCategory = await categoryRepository.save(category);

      const items = await Promise.all(categoryData.lineItems.map(async itemData => {
        const item = itemRepository.create({
          name: itemData.name,
          category: savedCategory, // Assign the saved category
        });

        // Save the item first to get its ID
        const savedItem = await itemRepository.save(item);

        const costs = await Promise.all(itemData.periods.map(async period => {
          const cost = costRepository.create({
            value: period,
            item: savedItem, // Assign the saved item
          });
          return costRepository.save(cost);
        }));

        savedItem.costs = costs; // Assign the costs to the item
        return savedItem;
      }));

      savedCategory.items = items; // Assign the items to the category
      await categoryRepository.save(savedCategory); // Save the category with its items
      console.log(`Saved Category: Done`);
    }
  }

  private readDirectCostJson() {
    const filePath = path.join(__dirname, '../../../frontend/src/data/direct-cost.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  }
}
