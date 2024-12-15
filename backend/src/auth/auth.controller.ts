import { Controller, Post, Get, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { FRONTEND_URL } from 'src/config/constants';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  @UseGuards(AuthGuard('saml'))
  @ApiOperation({ summary: 'Initiate SAML login' })
  @ApiResponse({ status: 302, description: 'Redirects to Costco SSO login page' })
  login() {
    // PassportJS + passport-saml creates SAML request with:
    // - RelayState = FRONTEND_URL
    // - Redirect URL = samlConfig.entryPoint (Costco SSO URL)
    // - Other SAML parameters from samlConfig
  }

  @Post('callback')
  @UseGuards(AuthGuard('saml'))
  @ApiOperation({ summary: 'SAML callback endpoint' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with JWT token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async callback(@Req() req, @Res() res: Response) {
    try {
      // 1. Get SAML response from Costco
      const samlUser = await this.authService.validateSamlUser(req.user);
      
      // 2. Create JWT token for our app
      const token = await this.authService.generateToken(samlUser);
      
      // 3. Redirect back to frontend with token
      res.redirect(`${FRONTEND_URL}/auth-success?token=${token}`);
    } catch (error) {
      res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
    }
  }

  @Get('metadata')
  @ApiOperation({ summary: 'Get SAML Service Provider metadata' })
  @ApiResponse({ 
    status: 200, 
    description: 'SAML metadata XML',
    content: {
      'application/xml': {
        example: '<?xml version="1.0"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata">...</md:EntityDescriptor>'
      }
    }
  })
  getMetadata() {
    // Return SAML metadata for SP configuration
    return this.authService.getMetadata();
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req, @Res() res: Response) {
    // Handle logout logic
    res.clearCookie('jwt');
    res.redirect(`${FRONTEND_URL}/login`);
  }

  @Post('dev-login')
  @ApiOperation({ summary: 'Development-only login endpoint' })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  async devLogin(@Res() res: Response) {
    if (process.env.NODE_ENV === 'development') {
      const token = await this.authService.generateDevToken({
        id: '123',
        email: 'dev@example.com',
        accessGranted: true
      });
      
      return res.status(HttpStatus.OK).json({ 
        token,
        message: 'Development login successful'
      });
    }
    
    return res.status(HttpStatus.NOT_FOUND).json({
      message: 'Endpoint not available in production'
    });
  }
} 