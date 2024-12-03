import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Period } from 'src/period/period.entity';

export class PeriodSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    const periodRepository = dataSource.getRepository(Period);

    const periods = [
      { name: 'Period 1', number: 1, month: 'September', isFrozen: true },
      { name: 'Period 2', number: 2, month: 'October', isFrozen: true },
      { name: 'Period 3', number: 3, month: 'November', isFrozen: false },
      { name: 'Period 4', number: 4, month: 'December', isFrozen: false },
      { name: 'Period 5', number: 5, month: 'January', isFrozen: false },
      { name: 'Period 6', number: 6, month: 'February', isFrozen: false },
      { name: 'Period 7', number: 7, month: 'March', isFrozen: false },
      { name: 'Period 8', number: 8, month: 'April', isFrozen: false },
      { name: 'Period 9', number: 9, month: 'May', isFrozen: false },
      { name: 'Period 10', number: 10, month: 'June', isFrozen: false },
      { name: 'Period 11', number: 11, month: 'July', isFrozen: false },
      { name: 'Period 12', number: 12, month: 'August', isFrozen: false },
      { name: 'Period 13', number: 13, month: null, isFrozen: false },
    ];
    // console.log("Periods: ", periods);
    for (const periodData of periods) {
    
      const period = periodRepository.create(periodData);
      // await periodRepository.save(period);
      console.log(`Saved Period: ${period.name} (${period.month || 'Special Period'})`);
    }
    console.log(`Seeding Periods: Done`);
  }
} 