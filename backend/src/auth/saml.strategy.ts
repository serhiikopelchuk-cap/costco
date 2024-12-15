import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-saml';
import { samlConfig } from '../config/saml.config';
import { AuthService } from './auth.service';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor(private authService: AuthService) {
    super(samlConfig);
  }

  async validate(profile: any) {
    return this.authService.validateSamlUser(profile);
  }
} 