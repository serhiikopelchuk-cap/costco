import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { DataSourceOptions } from 'typeorm/data-source';
import InitSeeder from './seeds/init.seeder';
import ormConfig from 'src/ormconfig';


ConfigModule.forRoot({
  envFilePath: '.env',
});

const options = {
  ...ormConfig,
  // type: 'postgres',
  // host: process.env.DATABASE_HOST || 'localhost',
  // port: parseInt(String(process.env.DATABASE_PORT), 10) || 5432,
  // username: process.env.DATABASE_USERNAME || 'postgres',
  // password: process.env.DATABASE_PASSWORD || 'postgres',
  // database: process.env.DATABASE_DATABASE || 'mydatabase',
  // entities: [__dirname + '/../src/**/*.entity.ts'],
//   migrationsTableName: 'migrations',
//   migrations: [__dirname + '/../migrations/**/*.ts'],
  seeds: [InitSeeder],
};

export const source = new DataSource(
  options as DataSourceOptions & SeederOptions,
);