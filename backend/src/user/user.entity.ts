import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Program } from '../program/program.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ nullable: true })
  ssoId: string;

  @Column({ type: 'jsonb', nullable: true })
  groups: string[];

  @Column({ default: false })
  accessGranted: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastLoginAt: Date;

  @ManyToMany(() => Program)
  @JoinTable()
  programs: Program[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }
} 