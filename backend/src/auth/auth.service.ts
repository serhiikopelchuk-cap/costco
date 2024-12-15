import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SamlUser } from './types/auth.types';
import { samlConfig } from '../config/saml.config';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateSamlUser(profile: any): Promise<SamlUser> {
    return {
      id: profile.nameID,
      email: profile.email,
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
    // Generate SAML metadata for Service Provider
    return `<?xml version="1.0"?>
    <md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                        entityID="${samlConfig.issuer}">
      <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:AssertionConsumerService
          Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
          Location="${samlConfig.callbackUrl}"
          index="1"/>
      </md:SPSSODescriptor>
    </md:EntityDescriptor>`;
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