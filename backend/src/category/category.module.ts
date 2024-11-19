import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { Item } from '../item/item.entity';
import { Cost } from '../cost/cost.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Item, Cost])],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {} 