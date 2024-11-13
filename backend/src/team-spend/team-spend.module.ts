import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamSpend } from './team-spend.entity';
import { TeamSpendService } from './team-spend.service';
import { TeamSpendController } from './team-spend.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeamSpend])],
  providers: [TeamSpendService],
  exports: [TeamSpendService],
  controllers: [TeamSpendController],
})
export class TeamSpendModule {}
