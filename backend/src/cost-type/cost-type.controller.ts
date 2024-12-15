import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CostTypeService } from './cost-type.service';
import { CostType, CreateCostTypeDto, CreateMultipleCostTypesDto } from './cost-type.entity';

@ApiTags('cost-types')
@Controller('cost-types')
export class CostTypeController {
  constructor(private readonly costTypeService: CostTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cost types' })
  @ApiResponse({
    status: 200,
    description: 'Return all cost types',
    type: [CostType]
  })
  findAll(): Promise<CostType[]> {
    return this.costTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cost type by ID' })
  @ApiParam({ name: 'id', description: 'Cost Type ID' })
  @ApiResponse({
    status: 200,
    description: 'Return a cost type',
    type: CostType
  })
  @ApiResponse({ status: 404, description: 'Cost type not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CostType> {
    return this.costTypeService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new cost type' })
  @ApiBody({
    type: CreateCostTypeDto,
    examples: {
      directCosts: {
        summary: 'Create Direct Costs type',
        value: {
          name: 'Direct Costs',
          alias: 'direct_costs'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'The cost type has been created',
    type: CostType
  })
  create(@Body() createDto: CreateCostTypeDto): Promise<CostType> {
    return this.costTypeService.create(createDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple cost types at once' })
  @ApiBody({
    type: CreateMultipleCostTypesDto,
    examples: {
      bothTypes: {
        summary: 'Create Direct and Indirect cost types',
        value: {
          costTypes: [
            { name: 'Direct Costs', alias: 'direct_costs' },
            { name: 'Indirect Costs', alias: 'indirect_costs' }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'The cost types have been created',
    type: [CostType]
  })
  createMultiple(@Body() createDto: CreateMultipleCostTypesDto): Promise<CostType[]> {
    return this.costTypeService.createMultiple(createDto.costTypes);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a cost type' })
  @ApiParam({ name: 'id', description: 'Cost Type ID' })
  @ApiBody({ type: CreateCostTypeDto })
  @ApiResponse({
    status: 200,
    description: 'The cost type has been updated',
    type: CostType
  })
  @ApiResponse({ status: 404, description: 'Cost type not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: CreateCostTypeDto
  ): Promise<CostType> {
    return this.costTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cost type' })
  @ApiParam({ name: 'id', description: 'Cost Type ID' })
  @ApiResponse({ status: 200, description: 'The cost type has been deleted' })
  @ApiResponse({ status: 404, description: 'Cost type not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.costTypeService.remove(id);
  }

  @Get('alias/:alias')
  @ApiOperation({ summary: 'Get a cost type by alias' })
  @ApiParam({ name: 'alias', description: 'Cost Type alias' })
  @ApiResponse({
    status: 200,
    description: 'Return a cost type by alias',
    type: CostType
  })
  @ApiResponse({ status: 404, description: 'Cost type not found' })
  findByAlias(@Param('alias') alias: string): Promise<CostType> {
    return this.costTypeService.findByAlias(alias);
  }
} 