import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './program.entity';
import { ProjectService } from '../project/project.service';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    private projectService: ProjectService
  ) {}

  findAll(): Promise<Program[]> {
    return this.programRepository.find({
      relations: [
        'projects',
        'projects.categories',
        'projects.categories.cloudProviders',
        'projects.categories.costType',
        'projects.categories.items.costs',
      ]
    });
  }

  async findOne(id: number): Promise<Program> {
    return await this.programRepository.findOne({ where: { id }, relations: [
      'projects', 
      'projects.categories',
      'projects.categories.cloudProviders',
      'projects.categories.items', 
      'projects.categories.items.costs',
      'projects.categories.costType'
    ] });
  }

  create(program: Program): Promise<Program> {
    return this.programRepository.save(program);
  }

  async update(id: number, program: Partial<Program>): Promise<Program> {
    await this.programRepository.update(id, program);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.programRepository.delete(id);
  }

  async clone(id: number): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: [
        'projects', 
        'projects.categories', 
        'projects.categories.cloudProviders', 
        'projects.categories.items', 
        'projects.categories.items.costs', 
        'projects.categories.costType']
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    const clonedProgram = this.programRepository.create({
      ...program,
      name: `${program.name} (Copy)`,
      id: undefined,
      projects: [],
      // costType: program.costType
    });

    const savedProgram = await this.programRepository.save(clonedProgram);

    const clonedProjects = await Promise.all(
      program.projects.map(async (project) => {
        const clonedProject = await this.projectService.clone(project.id, savedProgram.id);
        return clonedProject;
      })
    );

    savedProgram.projects = clonedProjects;

    return await this.programRepository.findOne({
      where: { id: savedProgram.id },
      relations: [
        'projects', 
        'projects.categories', 
        'projects.categories.cloudProviders', 
        'projects.categories.items', 
        'projects.categories.items.costs', 
        'projects.categories.costType']
    });
  }
} 