import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CostTypeService } from './cost-type.service';
import { CostType } from './cost-type.entity';

@ApiTags('cost-types')
@Controller('cost-types')
export class CostTypeController {
  constructor(private readonly costTypeService: CostTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cost types' })
  @ApiResponse({ status: 200, description: 'Return all cost types.' })
  findAll(): Promise<CostType[]> {
    return this.costTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cost type by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'CostType ID' })
  @ApiResponse({ status: 200, description: 'Return a cost type.' })
  findOne(@Param('id') id: string): Promise<CostType> {
    return this.costTypeService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new cost type' })
  @ApiBody({
    type: CostType,
    examples: {
      example1: {
        summary: 'Example CostType',
        value: {
          name: 'New CostType',
          alias: 'new-cost-type'
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The cost type has been successfully created.' })
  create(@Body() costType: CostType): Promise<CostType> {
    return this.costTypeService.create(costType);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a cost type by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'CostType ID' })
  @ApiBody({
    type: CostType,
    examples: {
      example1: {
        summary: 'Update CostType Example',
        value: {
          name: 'Updated CostType Name',
          alias: 'updated-cost-type'
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'The cost type has been successfully updated.' })
  update(@Param('id') id: string, @Body() costType: CostType): Promise<CostType> {
    return this.costTypeService.update(+id, costType);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cost type by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'CostType ID' })
  @ApiResponse({ status: 204, description: 'The cost type has been successfully deleted.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.costTypeService.remove(+id);
  }

  @Get('alias/:alias')
  @ApiOperation({ summary: 'Get a cost type by alias' })
  @ApiParam({ name: 'alias', type: 'string', description: 'CostType alias' })
  @ApiResponse({ status: 200, description: 'Return a cost type by alias.' })
  findByAlias(@Param('alias') alias: string): Promise<CostType> {
    return this.costTypeService.findByAlias(alias);
  }
} 