import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ClonedItemResponse, ItemService } from './item.service';
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

  @Put('bulk')
  @ApiOperation({ summary: 'Update multiple items at once' })
  @ApiResponse({ status: 200, description: 'Items have been successfully updated.' })
  @ApiBody({
    description: 'The items to update',
    examples: {
      example1: {
        summary: 'Example bulk update',
        value: {
          items: [
            {
              id: 1,
              costs: [
                { id: 1, value: 100 },
                { id: 2, value: 200 }
              ]
            },
            {
              id: 2,
              costs: [
                { id: 3, value: 300 },
                { id: 4, value: 400 }
              ]
            }
          ]
        }
      }
    }
  })
  async bulkUpdate(@Body() data: { items: Array<{ id: number; costs: Array<{ id: number; value: number }> }> }): Promise<Item[]> {
    return this.itemService.bulkUpdate(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item by ID' })
  @ApiResponse({ status: 200, description: 'Return an item.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  async findOne(@Param('id') id: number): Promise<Item> {
    return this.itemService.findOne(id);
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
          costs: Array(13).fill({ value: 150 })
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

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone an item by ID' })
  @ApiResponse({ status: 201, description: 'The item has been successfully cloned.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  async clone(@Param('id') id: number): Promise<ClonedItemResponse> {
    return this.itemService.clone(id);
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
          categoryId: 1,
          costs: Array(13).fill({ value: 100 })
        },
      },
    },
  })
  async create(@Body() itemData: Partial<Item> & { categoryId: number }): Promise<Item> {
    return this.itemService.create(itemData);
  }
} 