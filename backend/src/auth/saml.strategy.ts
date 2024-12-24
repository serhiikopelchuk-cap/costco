import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-saml';
import { AuthService } from './auth.service';
import { samlConfig } from '../config/saml.config';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor(private authService: AuthService) {
    super({
      ...samlConfig,
      passReqToCallback: true
    });
  }

  async validate(
    request: any,
    profile: any
  ): Promise<any> {
    console.log('SAML Profile:', JSON.stringify(profile, null, 2));
    console.log('accessGranted value:', profile.accessGranted, typeof profile.accessGranted);
    
    // Extract user information from SAML response
    const user = await this.authService.validateSamlUser({
      nameID: profile.nameID,
      email: profile.Email || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      accessGranted: profile.accessGranted === 'True' || profile.accessGranted === true,
      userId: profile.userID || profile.nameID
    });

    return user;
  }
} 