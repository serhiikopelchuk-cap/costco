import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PeriodService } from './period.service';
import { Period } from './period.entity';

@ApiTags('periods')
@Controller('periods')
export class PeriodController {
  constructor(private readonly periodService: PeriodService) {}

  @Get()
  @ApiOperation({ summary: 'Get all periods' })
  @ApiResponse({ status: 200, description: 'Return all periods', type: [Period] })
  findAll(): Promise<Period[]> {
    return this.periodService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get period by id' })
  @ApiResponse({ status: 200, description: 'Return period by id', type: Period })
  findOne(@Param('id') id: string): Promise<Period> {
    return this.periodService.findOne(+id);
  }

  @Get('frozen/:number')
  @ApiOperation({ summary: 'Check if period is frozen' })
  @ApiResponse({ status: 200, description: 'Return frozen status of period' })
  isFrozen(@Param('number') number: string): Promise<boolean> {
    return this.periodService.isFrozen(+number);
  }
} 