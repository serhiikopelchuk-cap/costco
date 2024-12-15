import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class CloudProvider {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Azure', description: 'Name of the cloud provider' })
  @Column({ unique: true })
  name: string;
}

// Add DTO classes for request validation and Swagger documentation
export class CreateCloudProviderDto {
  @ApiProperty({ example: 'Azure', description: 'Name of the cloud provider' })
  name: string;
}

export class CreateMultipleCloudProvidersDto {
  @ApiProperty({
    example: ['Azure', 'GCP'],
    description: 'Array of cloud provider names',
    type: [String]
  })
  names: string[];
} 