import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class TeamSpend {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the team spend record' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The name of the VP' })
  vpName: string;

  @Column()
  @ApiProperty({ description: 'The name of the team' })
  teamName: string;

  @Column('decimal')
  @ApiProperty({ description: 'The budget allocated to the team' })
  budget: number;
} 