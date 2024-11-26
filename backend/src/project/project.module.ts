import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { CategoryModule } from '../category/category.module';
import { Program } from '../program/program.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Program]),
    CategoryModule,
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
  exports: [ProjectService],
})
export class ProjectModule {} 