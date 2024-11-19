import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ItemService } from './item.service';
import { Item } from './item.entity';

@ApiTags('items')
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({ status: 200, description: 'Return all items.' })
  async findAll(): Promise<Item[]> {
    return this.itemService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item by ID' })
  @ApiResponse({ status: 200, description: 'Return an item.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  async findOne(@Param('id') id: number): Promise<Item> {
    return this.itemService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, description: 'The item has been successfully created.' })
  @ApiBody({
    description: 'The item to create',
    examples: {
      example1: {
        summary: 'Example item',
        value: {
          name: 'Example Item',
          costs: [
            { value: 100 },
            { value: 200 },
          ],
        },
      },
    },
  })
  async create(@Body() itemData: Partial<Item>): Promise<Item> {
    return this.itemService.create(itemData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an item by ID' })
  @ApiResponse({ status: 200, description: 'The item has been successfully updated.' })
  @ApiBody({
    description: 'The item data to update',
    examples: {
      example1: {
        summary: 'Example item update',
        value: {
          name: 'Updated Item Name',
          costs: [
            { value: 150 },
            { value: 250 },
          ],
        },
      },
    },
  })
  async update(@Param('id') id: number, @Body() itemData: Partial<Item>): Promise<Item> {
    return this.itemService.update(id, itemData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item by ID' })
  @ApiResponse({ status: 200, description: 'The item has been successfully deleted.' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.itemService.remove(id);
  }
} 