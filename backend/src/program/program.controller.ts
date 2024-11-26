import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ProgramService } from './program.service';
import { Program } from './program.entity';

@ApiTags('programs')
@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Get()
  @ApiOperation({ summary: 'Get all programs' })
  @ApiResponse({ status: 200, description: 'Return all programs.' })
  findAll(): Promise<Program[]> {
    return this.programService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a program by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Program ID' })
  @ApiResponse({ status: 200, description: 'Return a program.' })
  findOne(@Param('id') id: string): Promise<Program> {
    return this.programService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new program' })
  @ApiBody({
    type: Program,
    examples: {
      example1: {
        summary: 'Example Program',
        value: {
          name: 'New Program',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The program has been successfully created.' })
  create(@Body() program: Program): Promise<Program> {
    return this.programService.create(program);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a program by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Program ID' })
  @ApiBody({
    type: Program,
    examples: {
      example1: {
        summary: 'Update Program Example',
        value: {
          name: 'Updated Program Name',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'The program has been successfully updated.' })
  update(@Param('id') id: string, @Body() program: Program): Promise<Program> {
    return this.programService.update(+id, program);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a program by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Program ID' })
  @ApiResponse({ status: 204, description: 'The program has been successfully deleted.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.programService.remove(+id);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone a program by ID' })
  @ApiResponse({ status: 201, description: 'The program has been successfully cloned.' })
  @ApiResponse({ status: 404, description: 'Program not found.' })
  async clone(@Param('id') id: number): Promise<Program> {
    return this.programService.clone(id);
  }
} 