import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { Project } from './project.entity';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Return all projects.' })
  findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Return a project.' })
  findOne(@Param('id') id: string): Promise<Project> {
    return this.projectService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({
    type: Project,
    examples: {
      example1: {
        summary: 'Example Project',
        value: {
          name: 'New Project',
          program: { id: 1 }, // Assuming you have a program with ID 1
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The project has been successfully created.' })
  create(@Body() project: Project): Promise<Project> {
    return this.projectService.create(project);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project ID' })
  @ApiBody({
    type: Project,
    examples: {
      example1: {
        summary: 'Update Project Example',
        value: {
          name: 'Updated Project Name',
          program: { id: 1 }, // Assuming you have a program with ID 1
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'The project has been successfully updated.' })
  update(@Param('id') id: string, @Body() project: Project): Promise<Project> {
    return this.projectService.update(+id, project);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project ID' })
  @ApiResponse({ status: 204, description: 'The project has been successfully deleted.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.projectService.remove(+id);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone a project by ID' })
  @ApiResponse({ status: 201, description: 'The project has been successfully cloned.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  async clone(@Param('id') id: number): Promise<Project> {
    return this.projectService.clone(id);
  }
} 