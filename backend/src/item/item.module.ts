import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { Cost } from '../cost/cost.entity';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Cost])],
  providers: [ItemService],
  controllers: [ItemController],
})
export class ItemModule {} 