import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { mkdirSync, existsSync } from 'fs';
import { Category } from 'src/category/category.entity';
import { Item } from 'src/item/item.entity';
import { Cost } from 'src/cost/cost.entity';
import { Program } from 'src/program/program.entity';
import { Project } from 'src/project/project.entity';
import { CostType } from 'src/cost-type/cost-type.entity';
import { CloudProvider } from 'src/cloud-provider/cloud-provider.entity';

export class BasicDataSeeder implements Seeder {
  private ensureDataDirectoryExists() {
    const dataDir = path.join(process.cwd(), 'dist', 'database', 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
  }

  async run(
    dataSource: DataSource, 
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    this.ensureDataDirectoryExists();
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

    // Create single Program with settings
    const program = await programRepository.save({
      name: 'Main Program',
      description: 'Main program for all costs',
      settings: {
        teamName: "test team name",
        preparedBy: "test prepered by",
        directInvestment: 10,
        directGrowthRates: [10, 10, 10, 10, 10],
        indirectInvestment: 20,
        indirectGrowthRates: [20, 20, 20, 20, 20]
      },
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

  private getDataFilePath(filename: string): string {
    // Try multiple possible locations
    const possiblePaths = [
      path.join(process.cwd(), 'database', 'data', filename),
      path.join(process.cwd(), 'dist', 'database', 'data', filename),
      path.join(__dirname, '..', '..', 'database', 'data', filename),
      path.join(__dirname, '..', 'data', filename)
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        console.log('Found data file at:', filePath);
        return filePath;
      }
    }

    throw new Error(`Could not find ${filename} in any of the expected locations`);
  }

  private readIndirectCostJson() {
    const filePath = this.getDataFilePath('indirect-costs.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  private readDirectCostJson() {
    const filePath = this.getDataFilePath('direct-cost.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
} 