import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamSpend } from './team-spend.entity';

@Injectable()
export class TeamSpendService {
  constructor(
    @InjectRepository(TeamSpend)
    private teamSpendRepository: Repository<TeamSpend>,
  ) {}

  findAll(): Promise<TeamSpend[]> {
    return this.teamSpendRepository.find();
  }

  findOne(id: number): Promise<TeamSpend> {
    return this.teamSpendRepository.findOneBy({ id });
  }

  async create(teamSpend: TeamSpend): Promise<TeamSpend> {
    return this.teamSpendRepository.save(teamSpend);
  }

  async update(id: number, teamSpend: TeamSpend): Promise<TeamSpend> {
    await this.teamSpendRepository.update(id, teamSpend);
    return this.teamSpendRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.teamSpendRepository.delete(id);
  }
}
