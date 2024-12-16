import { Controller, Post, HttpStatus, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { runSeeders } from 'typeorm-extension';
import { PeriodSeeder } from '../../database/seeds/period.seeder';
import { BasicDataSeeder } from '../../database/seeds/basic-data.seeder';
import InitSeeder from '../../database/seeds/init.seeder';
import categoryFactory from '../../database/factories/category.factory';
import periodFactory from '../../database/factories/period.factory';

@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private dataSource: DataSource) {}

  @Post('reset-database')
  @ApiOperation({ summary: 'Reset database - drops all tables and recreates them' })
  @ApiResponse({ status: 200, description: 'Database reset successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resetDatabase() {
    try {
      // Drop tables in correct order
      const tables = [
        'category_cloud_providers_cloud_provider',
        'cost',
        'period',
        'item',
        'category',
        'project',
        'cloud_provider',
        'program',
        'cost_type'
      ];

      for (const table of tables) {
        await this.dataSource.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      }

      // Run migrations
      await this.dataSource.synchronize(true);

      return { message: 'Database reset successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to reset database: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('seed-database')
  @ApiOperation({ summary: 'Seed database with initial data' })
  @ApiResponse({ status: 200, description: 'Database seeded successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async seedDatabase() {
    try {
      console.log('Current working directory:', process.cwd());
      console.log('__dirname:', __dirname);
      
      await runSeeders(this.dataSource, {
        seeds: [InitSeeder],
        factories: [categoryFactory, periodFactory],
      });

      return { message: 'Database seeded successfully' };
    } catch (error) {
      console.error('Seeding error:', error);
      throw new HttpException(
        'Failed to seed database: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('reset-and-seed')
  @ApiOperation({ summary: 'Reset and seed database - combines reset and seed operations' })
  @ApiResponse({ status: 200, description: 'Database reset and seeded successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resetAndSeedDatabase() {
    try {
      await this.resetDatabase();
      await this.seedDatabase();
      return { message: 'Database reset and seeded successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to reset and seed database: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 