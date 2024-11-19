import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { plainToClass } from 'class-transformer';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Return all categories.' })
  async findAll(): Promise<Category[]> {
    const categories = await this.categoryService.findAll();
    return categories.map(category => plainToClass(Category, category));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({ status: 200, description: 'Return a category.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async findOne(@Param('id') id: number): Promise<Category> {
    const category = await this.categoryService.findOne(id);
    return plainToClass(Category, category);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category with items' })
  @ApiResponse({ status: 201, description: 'The category has been successfully created.' })
  @ApiBody({
    description: 'The category to create with items',
    examples: {
      example1: {
        summary: 'Example category with items',
        value: {
          name: 'Compute Costs',
          description: 'Costs associated with virtual machines',
          items: [
            { name: 'Azure Container Instances', costs: [20, 20, 20] },
            { name: 'Azure Kubernetes Service (AKS)', costs: [0, 0, 0] },
          ],
        },
      },
    },
  })
  async create(@Body() categoryData: Partial<Category>): Promise<Category> {
    const category = await this.categoryService.create(categoryData);
    return plainToClass(Category, category);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiResponse({ status: 200, description: 'The category has been successfully updated.' })
  @ApiBody({
    description: 'The category data to update',
    examples: {
      example1: {
        summary: 'Example category update',
        value: {
          name: 'Updated Compute Costs',
          description: 'Updated description for compute costs',
        },
      },
    },
  })
  async update(@Param('id') id: number, @Body() categoryData: Partial<Category>): Promise<Category> {
    const category = await this.categoryService.update(id, categoryData);
    return plainToClass(Category, category);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiResponse({ status: 200, description: 'The category has been successfully deleted.' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.categoryService.remove(id);
  }
} 