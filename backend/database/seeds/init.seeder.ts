import { DataSource } from 'typeorm';
import { runSeeders, Seeder, SeederFactoryManager } from 'typeorm-extension';
import { CategorySeeder } from './category.seeder';
import categoryFactory from '../factories/category.factory';
import periodFactory from '../factories/period.factory';
import { PeriodSeeder } from './period.seeder';

export default class InitSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    await runSeeders(dataSource, {
      seeds: [
        PeriodSeeder,
        CategorySeeder
      ],
      factories: [
        categoryFactory,
        periodFactory
      ],
    });
  }
}