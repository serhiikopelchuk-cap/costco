import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { Cost } from '../cost/cost.entity';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { Category } from 'src/category/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Cost, Category])],
  providers: [ItemService],
  controllers: [ItemController],
  exports: [ItemService],
})
export class ItemModule {} 