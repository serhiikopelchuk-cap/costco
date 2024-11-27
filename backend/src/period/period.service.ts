import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Period } from './period.entity';

@Injectable()
export class PeriodService {
  constructor(
    @InjectRepository(Period)
    private periodRepository: Repository<Period>,
  ) {}

  async findAll(): Promise<Period[]> {
    return this.periodRepository.find({
      order: {
        number: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Period> {
    return this.periodRepository.findOneBy({ id });
  }

  async isFrozen(periodNumber: number): Promise<boolean> {
    const period = await this.periodRepository.findOneBy({ number: periodNumber });
    return period?.isFrozen || false;
  }
} 