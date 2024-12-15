import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CloudProviderService } from './cloud-provider.service';
import { CloudProvider, CreateCloudProviderDto, CreateMultipleCloudProvidersDto } from './cloud-provider.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('cloud-providers')
@Controller('cloud-providers')
export class CloudProviderController {
  constructor(private readonly cloudProviderService: CloudProviderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cloud providers' })
  @ApiResponse({
    status: 200,
    description: 'Returns all cloud providers',
    type: [CloudProvider]
  })
  findAll(): Promise<CloudProvider[]> {
    return this.cloudProviderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cloud provider by ID' })
  @ApiParam({ name: 'id', description: 'Cloud provider ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a cloud provider by id',
    type: CloudProvider
  })
  @ApiResponse({ status: 404, description: 'Cloud provider not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CloudProvider> {
    return this.cloudProviderService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new cloud provider' })
  @ApiBody({ type: CreateCloudProviderDto })
  @ApiResponse({
    status: 201,
    description: 'Cloud provider has been created',
    type: CloudProvider
  })
  create(@Body() createDto: CreateCloudProviderDto): Promise<CloudProvider> {
    return this.cloudProviderService.create(createDto.name);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple cloud providers at once' })
  @ApiBody({ 
    type: CreateMultipleCloudProvidersDto,
    examples: {
      multipleProviders: {
        summary: 'Create Azure and GCP providers',
        value: {
          names: ['Azure', 'GCP']
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Cloud providers have been created',
    type: [CloudProvider]
  })
  createMultiple(@Body() createDto: CreateMultipleCloudProvidersDto): Promise<CloudProvider[]> {
    return this.cloudProviderService.createMultiple(createDto.names);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a cloud provider' })
  @ApiParam({ name: 'id', description: 'Cloud provider ID' })
  @ApiBody({ type: CreateCloudProviderDto })
  @ApiResponse({
    status: 200,
    description: 'Cloud provider has been updated',
    type: CloudProvider
  })
  @ApiResponse({ status: 404, description: 'Cloud provider not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: CreateCloudProviderDto
  ): Promise<CloudProvider> {
    return this.cloudProviderService.update(id, updateDto.name);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cloud provider' })
  @ApiParam({ name: 'id', description: 'Cloud provider ID' })
  @ApiResponse({ status: 200, description: 'Cloud provider has been deleted' })
  @ApiResponse({ status: 404, description: 'Cloud provider not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.cloudProviderService.remove(id);
  }
} 