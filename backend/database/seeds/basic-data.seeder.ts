import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Category } from 'src/category/category.entity';
import { Item } from 'src/item/item.entity';
import { Cost } from 'src/cost/cost.entity';
import { Program } from 'src/program/program.entity';
import { Project } from 'src/project/project.entity';
import { CostType } from 'src/cost-type/cost-type.entity';
import { CloudProvider } from 'src/cloud-provider/cloud-provider.entity';

export class BasicDataSeeder implements Seeder {
  async run(
    dataSource: DataSource, 
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    const categoryRepository = dataSource.getRepository(Category);
    const itemRepository = dataSource.getRepository(Item);
    const costRepository = dataSource.getRepository(Cost);
    const programRepository = dataSource.getRepository(Program);
    const projectRepository = dataSource.getRepository(Project);
    const costTypeRepository = dataSource.getRepository(CostType);
    const cloudProviderRepository = dataSource.getRepository(CloudProvider);

    // Create Cloud Providers
    const cloudProviders = await cloudProviderRepository.save([
      { name: 'Azure' },
      { name: 'GCP' },
    ]);

    // Create CostTypes
    const directCostType = await this.createCostType(costTypeRepository, 'direct_costs');
    const indirectCostType = await this.createCostType(costTypeRepository, 'indirect_costs');

    // Create Programs and Projects for each CostType
    const directProgram = await this.createProgramAndProject(programRepository, projectRepository, directCostType, 'Direct');
    const indirectProgram = await this.createProgramAndProject(programRepository, projectRepository, indirectCostType, 'Indirect');

    // Seed categories for direct costs
    const directData = this.readDirectCostJson();
    await this.seedCategories(categoryRepository, itemRepository, costRepository, directData, directProgram.project, cloudProviders, costTypeRepository, 'direct_costs');

    // Seed categories for indirect costs
    const indirectData = this.readIndirectCostJson();
    await this.seedCategories(categoryRepository, itemRepository, costRepository, indirectData, indirectProgram.project, cloudProviders, costTypeRepository, 'indirect_costs');
  }

  private async createCostType(costTypeRepository, alias) {
    let costType = await costTypeRepository.findOne({ where: { alias } });
    if (!costType) {
      costType = costTypeRepository.create({ alias });
      costType = await costTypeRepository.save(costType);
    }
    return costType;
  }

  private async createProgramAndProject(programRepository, projectRepository, costType, type) {
    const program = programRepository.create({
      name: `${type} Program`,
      description: `This is a ${type.toLowerCase()} program for seeding purposes`,
      costType
    });
    const savedProgram = await programRepository.save(program);

    const project = projectRepository.create({
      name: `${type} Project`,
      description: `This is a ${type.toLowerCase()} project for seeding purposes`,
      program: savedProgram,
    });
    const savedProject = await projectRepository.save(project);

    return { program: savedProgram, project: savedProject };
  }

  private async seedCategories(categoryRepository, itemRepository, costRepository, data, project, cloudProviders, costTypeRepository, costTypeAlias) {
    for (const categoryData of data.categories) {
      const associatedProviders = cloudProviders.filter(provider => categoryData.cloudProvider.includes(provider.name.toLowerCase()));

      categoryData.costTypeAlias = costTypeAlias;

      const costType = await costTypeRepository.findOne({ where: { alias: categoryData.costTypeAlias } });

      const category = categoryRepository.create({
        name: categoryData.name,
        description: categoryData.description,
        note: categoryData.note,
        project, // Associate with the project
        cloudProviders: associatedProviders, // Associate relevant cloud providers
        costType, // Associate the found costType
      });

      const savedCategory = await categoryRepository.save(category);

      if (categoryData.lineItems && categoryData.lineItems.length > 0) {
        const items = await Promise.all(categoryData.lineItems.map(async itemData => {
          const item = itemRepository.create({
            name: itemData.name,
            category: savedCategory,
          });
          const savedItem = await itemRepository.save(item);

          const costs = await Promise.all(itemData.costs.map(async period => {
            const cost = costRepository.create({
              value: period,
              item: savedItem,
            });
            return costRepository.save(cost);
          }));

          savedItem.costs = costs;
          return savedItem;
        }));

        savedCategory.items = items;
      } else {
        savedCategory.items = [];
      }

      await categoryRepository.save(savedCategory);
    }
    
    console.log(`Seeding Categories ${costTypeAlias}: Done`);
  }

  private readIndirectCostJson() {
    const filePath = path.join(__dirname, '../data/indirect-costs.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  }

  private readDirectCostJson() {
    const filePath = path.join(__dirname, '../data/direct-cost.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  }
} 