import { Test, TestingModule } from '@nestjs/testing';
import { TeamSpendService } from './team-spend.service';

describe('TeamSpendService', () => {
  let service: TeamSpendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamSpendService],
    }).compile();

    service = module.get<TeamSpendService>(TeamSpendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
