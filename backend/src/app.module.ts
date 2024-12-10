import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from './ormconfig';
import { TeamSpendModule } from './team-spend/team-spend.module';
import { CategoryModule } from './category/category.module';
import { ItemModule } from './item/item.module';
import { ProjectModule } from './project/project.module';
import { ProgramModule } from './program/program.module';
import { PeriodModule } from './period/period.module';
import { CostTypeModule } from './cost-type/cost-type.module';
import { CloudProviderModule } from './cloud-provider/cloud-provider.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    TeamSpendModule,
    CategoryModule,
    ItemModule,
    ProjectModule,
    ProgramModule,
    PeriodModule,
    CostTypeModule,
    CloudProviderModule,
  ],
})
export class AppModule {}
