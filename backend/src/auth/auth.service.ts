import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Strategy, SamlConfig } from 'passport-saml';
import { SamlUser } from './types/auth.types';
import { samlConfig } from '../config/saml.config';

@Injectable()
export class AuthService {
  private samlStrategy: Strategy;

  constructor(private jwtService: JwtService) {
    // Initialize SAML strategy for metadata generation
    const strategyConfig: SamlConfig = {
      ...samlConfig,
      passReqToCallback: true,
      signatureAlgorithm: samlConfig.signatureAlgorithm as 'sha256' | 'sha512',
      cert: samlConfig.cert || '',
      entryPoint: samlConfig.entryPoint || ''
    };

    this.samlStrategy = new Strategy(
      strategyConfig,
      () => {} // Dummy callback, not used for metadata generation
    );
  }

  async validateSamlUser(profile: any): Promise<SamlUser> {
    // Generate a unique ID if none provided
    const userId = profile.nameID || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Use a default email if none provided
    const userEmail = profile.email || `${userId}@placeholder.com`;

    return {
      id: userId,
      email: userEmail,
      accessGranted: profile.accessGranted === 'true',
    };
  }

  async generateToken(user: SamlUser): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      accessGranted: user.accessGranted,
    };

    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<any> {
    return this.jwtService.verify(token);
  }

  getMetadata(): string {
    return this.samlStrategy.generateServiceProviderMetadata(
      samlConfig.cert,
      samlConfig.cert
    );
  }

  async generateDevToken(user: SamlUser): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      accessGranted: user.accessGranted,
      isDev: true // Mark as development token
    };

    return this.jwtService.sign(payload);
  }
} 