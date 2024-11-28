import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostType } from './cost-type.entity';
import { CostTypeService } from './cost-type.service';
import { CostTypeController } from './cost-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CostType])],
  providers: [CostTypeService],
  controllers: [CostTypeController],
})
export class CostTypeModule {} 