import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CloudProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
} 