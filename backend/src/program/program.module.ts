import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './program.entity';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Program]),
    ProjectModule,
  ],
  providers: [ProgramService],
  controllers: [ProgramController],
})
export class ProgramModule {} 