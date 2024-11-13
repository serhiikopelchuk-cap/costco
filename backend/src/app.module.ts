import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamSpendModule } from './team-spend/team-spend.module';

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
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres', // This should match the service name in docker-compose
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'mydatabase',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TeamSpendModule,
  ],
})
export class AppModule {}
