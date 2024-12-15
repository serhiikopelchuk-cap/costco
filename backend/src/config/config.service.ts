import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
  }

  get backendUrl(): string {
    return this.configService.get<string>('BACKEND_URL', 'http://localhost:3000');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'your-secret-key');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }
} 