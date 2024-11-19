import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamSpendModule } from './team-spend/team-spend.module';
import { CategoryModule } from './category/category.module';
import { ItemModule } from './item/item.module';

@Module({
  imports: [
    /*
      SQLite database configuration
      {
        type: 'sqlite',
        database: 'database.sqlite',
        synchronize: true,
      }
    */
    TypeOrmModule.forRoot({
      // type: 'sqlite',
      // database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost', // 'postgres', // This should match the service name in docker-compose
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'mydatabase',
      synchronize: true,
    }),
    TeamSpendModule,
    CategoryModule,
    ItemModule,
  ],
})
export class AppModule {}
