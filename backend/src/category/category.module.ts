import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './category.entity';
import { Item } from '../item/item.entity';
import { Cost } from '../cost/cost.entity';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Item, Cost]),
    ItemModule,
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {} 