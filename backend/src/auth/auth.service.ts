import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Strategy, SamlConfig } from 'passport-saml';
import { SamlUser } from './types/auth.types';
import { samlConfig } from '../config/saml.config';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Profile, VerifiedCallback } from 'passport-saml';

@Injectable()
export class AuthService {
  private samlStrategy: Strategy;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.samlStrategy = new Strategy(
      {
        ...samlConfig,
        passReqToCallback: true,
      } as SamlConfig,
      this.validate.bind(this),
    );
  }

  async validate(
    req: Request,
    profile: Profile,
    done: VerifiedCallback,
  ): Promise<void> {
    try {
      console.log('=== Starting SAML validation ===');
      console.log('SAML Profile:', JSON.stringify(profile, null, 2));
      console.log('Raw Request Body:', req.body);
      
      // Extract user info from SAML profile
      const userInfo = {
        id: profile.nameID,
        email: profile.Email || profile.email, // Note: case sensitivity matters
        accessGranted: profile.accessGranted === 'True' || profile.accessGranted === true,
        groups: profile.userGroup || [],
      };
      
      console.log('Extracted user info:', JSON.stringify(userInfo, null, 2));

      if (!userInfo.email) {
        console.error('No email found in profile!');
        console.log('Available profile keys:', Object.keys(profile));
      }

      console.log('=== Completing SAML validation ===');
      done(null, userInfo);
      console.log('=== Done callback executed ===');
    } catch (error) {
      console.error('=== Error in SAML validation ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      done(error as Error);
    }
  }

  async createToken(user: any): Promise<string> {
    try {
      console.log('=== Creating token ===');
      console.log('User data for token:', JSON.stringify(user, null, 2));
      
      const payload = {
        sub: user.id,
        email: user.email,
        accessGranted: user.accessGranted,
        groups: user.groups,
      };
      
      console.log('Token payload:', JSON.stringify(payload, null, 2));
      const token = await this.jwtService.sign(payload);
      console.log('Token created successfully, length:', token.length);
      
      return token;
    } catch (error) {
      console.error('=== Error creating token ===');
      console.error('Error details:', error);
      throw error;
    }
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