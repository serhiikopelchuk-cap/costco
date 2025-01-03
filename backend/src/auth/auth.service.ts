import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Strategy, SamlConfig } from 'passport-saml';
import { SamlUser } from './types/auth.types';
import { samlConfig } from '../config/saml.config';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Profile, VerifiedCallback } from 'passport-saml';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  private samlStrategy: Strategy;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {
    this.samlStrategy = new Strategy(
      {
        ...samlConfig,
        passReqToCallback: true,
      } as SamlConfig,
      this.validate.bind(this),
    );
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async loginWithCredentials(email: string, password: string): Promise<{ token: string; user: User }> {
    const user = await this.validateCredentials(email, password);
    const token = await this.createToken(user);

    // Update last login
    await this.userService.update(user.id, { lastLoginAt: new Date() });

    return { token, user };
  }

  async validate(
    req: Request,
    profile: Profile,
    done: VerifiedCallback,
  ): Promise<void> {
    try {
      console.log('=== Starting SAML validation ===');
      console.log('SAML Profile:', JSON.stringify(profile, null, 2));
      
      const email = profile.Email || profile.email;
      if (typeof email !== 'string') {
        console.error('No valid email found in profile!');
        done(new Error('No valid email found in SAML profile'));
        return;
      }

      // Extract user info from SAML profile
      const userInfo = {
        ssoId: profile.nameID as string,
        email,
        accessGranted: profile.accessGranted === 'True' || profile.accessGranted === true,
        groups: (profile.userGroup || []) as string[],
      };
      
      console.log('Extracted user info:', JSON.stringify(userInfo, null, 2));

      // Create or update user in database
      const user = await this.userService.createOrUpdateFromSso(userInfo);
      console.log('User created/updated:', user);

      // Convert User instance to plain object
      const userPlain = {
        id: user.id,
        email: user.email,
        name: user.name,
        ssoId: user.ssoId,
        accessGranted: user.accessGranted,
        groups: user.groups,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt
      };

      done(null, userPlain);
    } catch (error) {
      console.error('=== Error in SAML validation ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      done(error as Error);
    }
  }

  async createToken(user: User): Promise<string> {
    try {
      console.log('=== Creating token ===');
      
      const payload = {
        sub: user.id,
        email: user.email,
        accessGranted: user.accessGranted,
        groups: user.groups,
        ssoId: user.ssoId
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
    const userInfo = {
      ssoId: profile.nameID || profile.userId,
      email: profile.email as string,
      accessGranted: profile.accessGranted === 'true',
      groups: (profile.userGroup || []) as string[],
    };

    const user = await this.userService.createOrUpdateFromSso(userInfo);
    return {
      id: user.ssoId,
      email: user.email,
      accessGranted: user.accessGranted,
    };
  }

  async generateToken(user: SamlUser): Promise<string> {
    const dbUser = await this.userService.findBySsoId(user.id);
    if (!dbUser) {
      throw new Error('User not found in database');
    }

    const payload = {
      sub: dbUser.id,
      email: dbUser.email,
      accessGranted: dbUser.accessGranted,
      groups: dbUser.groups,
      ssoId: dbUser.ssoId
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
    const userInfo = {
      ssoId: user.id,
      email: user.email,
      accessGranted: user.accessGranted,
      groups: [] as string[],
    };

    const dbUser = await this.userService.createOrUpdateFromSso(userInfo);

    const payload = {
      sub: dbUser.id,
      email: dbUser.email,
      accessGranted: dbUser.accessGranted,
      groups: dbUser.groups,
      ssoId: dbUser.ssoId,
      isDev: true
    };

    return this.jwtService.sign(payload);
  }
} 