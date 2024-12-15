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

    // Create or get existing Cloud Providers
    const cloudProviders = await this.getOrCreateCloudProviders(cloudProviderRepository);

    // Create CostTypes
    const directCostType = await this.createCostType(costTypeRepository, 'direct_costs');
    const indirectCostType = await this.createCostType(costTypeRepository, 'indirect_costs');

    // Create single Program and Project
    const program = await programRepository.save({
      name: 'Main Program',
      description: 'Main program for all costs',
      settings: {},
    });

    const project = await projectRepository.save({
      name: 'Main Project',
      program,
      settings: {},
    });

    // Seed categories for direct costs
    const directData = this.readDirectCostJson();
    await this.seedCategories(
      categoryRepository, 
      itemRepository, 
      costRepository, 
      directData, 
      project, 
      cloudProviders,
      directCostType
    );

    // Seed categories for indirect costs
    const indirectData = this.readIndirectCostJson();
    await this.seedCategories(
      categoryRepository, 
      itemRepository, 
      costRepository, 
      indirectData, 
      project, 
      cloudProviders,
      indirectCostType
    );
  }

  private async getOrCreateCloudProviders(cloudProviderRepository) {
    const providers = ['Azure', 'GCP'];
    const cloudProviders = [];

    for (const providerName of providers) {
      let provider = await cloudProviderRepository.findOne({ 
        where: { name: providerName } 
      });

      if (!provider) {
        provider = await cloudProviderRepository.save({ 
          name: providerName 
        });
        console.log(`Created new cloud provider: ${providerName}`);
      } else {
        console.log(`Using existing cloud provider: ${providerName}`);
      }

      cloudProviders.push(provider);
    }

    return cloudProviders;
  }

  private async createCostType(costTypeRepository, alias) {
    let costType = await costTypeRepository.findOne({ where: { alias } });
    if (!costType) {
      costType = costTypeRepository.create({ alias });
      costType = await costTypeRepository.save(costType);
    }
    return costType;
  }

  private async seedCategories(
    categoryRepository, 
    itemRepository, 
    costRepository, 
    data, 
    project, 
    cloudProviders,
    costType
  ) {
    for (const categoryData of data.categories) {
      const associatedProviders = cloudProviders.filter(provider => 
        categoryData.cloudProvider.includes(provider.name.toLowerCase())
      );

      const category = categoryRepository.create({
        name: categoryData.name,
        description: categoryData.description,
        note: categoryData.note,
        project,
        cloudProviders: associatedProviders,
        costType, // Assign the cost type to the category
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
    
    console.log(`Seeding Categories: Done`);
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