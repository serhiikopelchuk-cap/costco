import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Program } from '../program/program.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['programs']
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'programs',
        'programs.projects',
        'programs.projects.categories',
        'programs.projects.categories.cloudProviders',
        'programs.projects.categories.items',
        'programs.projects.categories.items.costs',
        'programs.projects.categories.costType'
    ]
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['programs']
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'isActive', 'accessGranted', 'groups', 'ssoId', 'lastLoginAt'],
      relations: ['programs']
    });
  }

  async findBySsoId(ssoId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { ssoId },
      relations: ['programs']
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async addProgram(userId: number, programId: number): Promise<User> {
    const user = await this.findOne(userId);
    if (!user.programs.some(p => p.id === programId)) {
      user.programs.push({ id: programId } as Program);
      await this.userRepository.save(user);
    }
    return this.findOne(userId);
  }

  async removeProgram(userId: number, programId: number): Promise<User> {
    const user = await this.findOne(userId);
    user.programs = user.programs.filter(p => p.id !== programId);
    await this.userRepository.save(user);
    return this.findOne(userId);
  }

  async createOrUpdateFromSso(ssoData: {
    ssoId: string;
    email: string;
    accessGranted: boolean;
    groups?: string[];
  }): Promise<User> {
    let user = await this.findBySsoId(ssoData.ssoId);
    
    if (!user) {
      user = await this.findByEmail(ssoData.email);
    }

    if (user) {
      // Update existing user
      return this.update(user.id, {
        ...ssoData,
        lastLoginAt: new Date(),
      });
    }

    // Create new user
    return this.create({
      ssoId: ssoData.ssoId,
      email: ssoData.email,
      name: ssoData.email.split('@')[0], // Default name from email
      accessGranted: ssoData.accessGranted,
      groups: ssoData.groups,
      lastLoginAt: new Date(),
    });
  }

  async createWithPassword(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = this.userRepository.create({
      ...userData,
      accessGranted: true,
      isActive: true,
      lastLoginAt: new Date(),
    });

    return this.userRepository.save(user);
  }
} 