import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SamlStrategy } from './saml.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';

@Module({
  imports: [
    PassportModule,
    AppConfigModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '1h' },
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [SamlStrategy, AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {} 