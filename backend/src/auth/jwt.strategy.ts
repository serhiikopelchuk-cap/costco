import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    try {
      console.log('Validating JWT payload:', payload);
      
      // Verify user exists and is active
      const user = await this.userService.findOne(payload.sub);
      if (!user || !user.isActive) {
        console.log('User not found or inactive:', payload.sub);
        throw new UnauthorizedException('User not found or inactive');
      }

      // Return user info without checking accessGranted
      return {
        sub: user.id,
        email: user.email,
        accessGranted: user.accessGranted, // Include it in the response but don't check it
        groups: user.groups,
        ssoId: user.ssoId
      };
    } catch (error) {
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
} 