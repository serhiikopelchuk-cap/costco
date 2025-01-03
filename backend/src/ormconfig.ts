import { DataSourceOptions } from 'typeorm';
import { CloudProvider } from './cloud-provider/cloud-provider.entity';

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
  database: process.env.DATABASE_NAME || 'mydatabase',
  entities: [__dirname + '/**/*.entity{.ts,.js}', CloudProvider],
  synchronize: true,
};

export default ormConfig;
