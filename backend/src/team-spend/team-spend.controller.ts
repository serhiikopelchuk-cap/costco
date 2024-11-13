import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TeamSpendService } from './team-spend.service';
import { TeamSpend } from './team-spend.entity';

@ApiTags('team-spend')
@Controller('team-spend')
export class TeamSpendController {
  constructor(private readonly teamSpendService: TeamSpendService) {}

  @Get()
  @ApiOperation({ summary: 'Get all team spend records' })
  @ApiResponse({ status: 200, description: 'Return all team spend records.' })
  findAll(): Promise<TeamSpend[]> {
    return this.teamSpendService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team spend record by ID' })
  @ApiResponse({ status: 200, description: 'Return a team spend record.' })
  @ApiResponse({ status: 404, description: 'Record not found.' })
  findOne(@Param('id') id: number): Promise<TeamSpend> {
    return this.teamSpendService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new team spend record' })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  create(@Body() teamSpend: TeamSpend): Promise<TeamSpend> {
    return this.teamSpendService.create(teamSpend);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a team spend record by ID' })
  @ApiResponse({ status: 200, description: 'The record has been successfully updated.' })
  update(@Param('id') id: number, @Body() teamSpend: TeamSpend): Promise<TeamSpend> {
    return this.teamSpendService.update(id, teamSpend);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a team spend record by ID' })
  @ApiResponse({ status: 200, description: 'The record has been successfully deleted.' })
  remove(@Param('id') id: number): Promise<void> {
    return this.teamSpendService.remove(id);
  }
}
