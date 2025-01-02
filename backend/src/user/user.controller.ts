import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './user.entity';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'Return a user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  create(@Body() user: Partial<User>): Promise<User> {
    return this.userService.create(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  update(@Param('id') id: string, @Body() user: Partial<User>): Promise<User> {
    return this.userService.update(+id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(+id);
  }

  @Post(':userId/programs/:programId')
  @ApiOperation({ summary: 'Add a program to a user' })
  @ApiResponse({ status: 200, description: 'The program has been successfully added to the user.' })
  @ApiResponse({ status: 404, description: 'User or program not found.' })
  addProgram(
    @Param('userId') userId: string,
    @Param('programId') programId: string,
  ): Promise<User> {
    return this.userService.addProgram(+userId, +programId);
  }

  @Delete(':userId/programs/:programId')
  @ApiOperation({ summary: 'Remove a program from a user' })
  @ApiResponse({ status: 200, description: 'The program has been successfully removed from the user.' })
  @ApiResponse({ status: 404, description: 'User or program not found.' })
  removeProgram(
    @Param('userId') userId: string,
    @Param('programId') programId: string,
  ): Promise<User> {
    return this.userService.removeProgram(+userId, +programId);
  }
} 