import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-saml';
import { samlConfig, isSamlConfigured } from '../config/saml.config';

const DEV_USER = {
  id: 'dev-user',
  email: 'dev@example.com',
  name: 'Development User'
};

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Create a dummy config for passport-saml when SAML is not configured
    const dummyConfig = {
      entryPoint: 'http://localhost',
      issuer: 'dummy',
      cert: 'dummy',
      privateKey: 'dummy',
      // Add required callback to handle the response
      passReqToCallback: true
    };

    super(isSamlConfigured() ? samlConfig : dummyConfig);

    if (!isSamlConfigured()) {
      console.warn('SAML is not configured. Using development authentication.');
    }
  }

  async validate(request: any, profile: any, done: Function) {
    if (!isSamlConfigured()) {
      return done(null, DEV_USER);
    }

    try {
      const user = {
        id: profile.nameID,
        email: profile.email,
        name: profile.displayName,
      };
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
} 