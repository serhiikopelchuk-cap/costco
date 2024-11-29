import { DataSourceOptions } from 'typeorm';

const ormConfig: DataSourceOptions = {
  // SQLite database configuration
  /*
  {
    type: 'sqlite',
    database: 'database.sqlite',
    synchronize: true,
  }
  */
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost', // 'postgres', // This should match the service name in docker-compose
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'postgres',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
};

export default ormConfig;
