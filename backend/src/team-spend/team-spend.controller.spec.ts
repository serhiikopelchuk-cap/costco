import { Test, TestingModule } from '@nestjs/testing';
import { TeamSpendController } from './team-spend.controller';

describe('TeamSpendController', () => {
  let controller: TeamSpendController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamSpendController],
    }).compile();

    controller = module.get<TeamSpendController>(TeamSpendController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
