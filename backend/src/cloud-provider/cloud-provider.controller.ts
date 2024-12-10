import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CloudProviderService } from './cloud-provider.service';
import { CloudProvider } from './cloud-provider.entity';

@Controller('cloud-providers')
export class CloudProviderController {
  constructor(private readonly cloudProviderService: CloudProviderService) {}

  @Get()
  findAll(): Promise<CloudProvider[]> {
    return this.cloudProviderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<CloudProvider> {
    return this.cloudProviderService.findOne(id);
  }

  @Post()
  create(@Body('name') name: string): Promise<CloudProvider> {
    return this.cloudProviderService.create(name);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body('name') name: string): Promise<CloudProvider> {
    return this.cloudProviderService.update(id, name);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.cloudProviderService.remove(id);
  }
} 