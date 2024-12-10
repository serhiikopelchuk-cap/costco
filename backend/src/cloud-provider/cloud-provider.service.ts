import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudProvider } from './cloud-provider.entity';

@Injectable()
export class CloudProviderService {
  constructor(
    @InjectRepository(CloudProvider)
    private cloudProviderRepository: Repository<CloudProvider>,
  ) {}

  findAll(): Promise<CloudProvider[]> {
    return this.cloudProviderRepository.find();
  }

  findOne(id: number): Promise<CloudProvider> {
    return this.cloudProviderRepository.findOneBy({ id });
  }

  create(name: string): Promise<CloudProvider> {
    const provider = this.cloudProviderRepository.create({ name });
    return this.cloudProviderRepository.save(provider);
  }

  async update(id: number, name: string): Promise<CloudProvider> {
    await this.cloudProviderRepository.update(id, { name });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.cloudProviderRepository.delete(id);
  }
} 