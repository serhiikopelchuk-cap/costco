import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CategoryService } from '../category/category.service';
import { Program } from '../program/program.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    private categoryService: CategoryService
  ) {}

  findAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: ['categories', 'program'] });
  }

  async findOne(id: number): Promise<Project> {
    return await this.projectRepository.findOne({ where: { id }, relations: ['categories', 'categories.items', 'categories.items.costs'] });
  }

  create(project: Project): Promise<Project> {
    return this.projectRepository.save(project);
  }

  async update(id: number, project: Partial<Project>): Promise<Project> {
    await this.projectRepository.update(id, project);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.projectRepository.delete(id);
  }

  async clone(id: number, programId?: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['categories', 'categories.items', 'categories.items.costs', 'program'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const clonedProgram = programId
      ? await this.programRepository.findOne({ where: { id: programId } })
      : project.program;

    if (!clonedProgram) {
      throw new NotFoundException(`Program with ID ${programId || project.program.id} not found`);
    }

    const clonedProject = this.projectRepository.create({
      ...project,
      name: `${project.name} (Copy)`,
      id: undefined,
      program: clonedProgram,
      categories: []
    });

    const savedProject = await this.projectRepository.save(clonedProject);

    const clonedCategories = await Promise.all(
      project.categories.map(async (category) => {
        const clonedCategory = await this.categoryService.clone(category.id, savedProject.id);
        return clonedCategory;
      })
    );

    savedProject.categories = clonedCategories;

    return await this.projectRepository.findOne({
      where: { id: savedProject.id },
      relations: ['categories', 'categories.items', 'categories.items.costs']
    });
  }
} 