import { Controller, Post, Get, UseGuards, Req, Res, HttpStatus, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint, ApiBody } from '@nestjs/swagger';
import { FRONTEND_URL } from 'src/config/constants';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from '../user/user.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        RelayState: {
          type: 'string',
          example: 'RelayState=https://frontend.totalcost.ecp-aks.adt-gen.c2.westus2.np.ct-costco.internal'
        },
        SAMLResponse: {
          type: 'string',
          example: 'PHNhbWxwOlJlc3BvbnNlIFZlcnNpb249IjIuMCI....[truncated]'
        }
      },
      required: ['RelayState', 'SAMLResponse']
    },
    description: 'SAML Response data from Identity Provider',
    examples: {
      'SAML Callback Example': {
        value: {
          RelayState: 'RelayState=https://frontend.totalcost.ecp-aks.adt-gen.c2.westus2.np.ct-costco.internal',
          SAMLResponse: 'PHNhbWxwOlJlc3BvbnNlIFZlcnNpb249IjIuMCI...[truncated for brevity]'
        }
      }
    }
  })
  async callback(@Req() req, @Res() res: Response) {
    try {
      console.log('=== Processing SAML callback ===');
      console.log('Request user:', req.user);
      console.log('Request body:', req.body);

      if (!req.user) {
        console.error('No user data in request');
        throw new Error('Authentication failed - no user data');
      }

      // Create JWT token
      const token = await this.authService.generateToken(req.user);
      console.log('Generated token length:', token.length);

      // Get the redirect URL
      let redirectUrl = req.body?.RelayState?.replace('RelayState=', '');
      if (!redirectUrl) {
        redirectUrl = process.env.FRONTEND_URL;
      }
      if (!redirectUrl) {
        redirectUrl = 'http://localhost:3001';
      }

      console.log('Environment:', process.env.NODE_ENV);
      console.log('Redirect URL:', redirectUrl);
      console.log('RelayState:', req.body?.RelayState);

      // Get user from database to ensure it exists
      const user = await this.userService.findBySsoId(req.user.id);
      if (!user) {
        console.error('User not found in database after SSO');
        throw new Error('User not found after authentication');
      }

      const finalRedirectUrl = `${redirectUrl}/auth-success?token=${token}`;
      console.log('Final redirect URL:', finalRedirectUrl);

      // Check if the request is from a browser (accepts HTML)
      const acceptHeader = req.get('Accept') || '';
      if (acceptHeader.includes('text/html')) {
        // Browser request - send redirect
        return res.status(302).header('Location', finalRedirectUrl).send();
      } else {
        // API request - send JSON response
        return res.status(200).json({
          success: true,
          redirectUrl: finalRedirectUrl,
          token
        });
      }
    } catch (error) {
      console.error('=== Error in SAML callback ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      
      // Use the same redirect URL logic for errors
      let redirectUrl = req.body?.RelayState?.replace('RelayState=', '');
      if (!redirectUrl) {
        redirectUrl = process.env.FRONTEND_URL;
      }
      if (!redirectUrl) {
        let redirectUrl = 'http://localhost:3001';
      }
      
      const errorUrl = `${redirectUrl}/login?error=${encodeURIComponent(error.message || 'authentication_failed')}`;
      
      const acceptHeader = req.get('Accept') || '';
      if (acceptHeader.includes('text/html')) {
        return res.status(302).header('Location', errorUrl).send();
      } else {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          details: error.message
        });
      }
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

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user profile.' })
  async getProfile(@Req() req: any) {
    console.log('Getting profile for user:', req.user);
    
    if (!req.user?.sub) {
      console.error('No user ID in request');
      return null;
    }

    try {
      const user = await this.userService.findOne(req.user.sub);
      if (!user) {
        console.error('User not found:', req.user.sub);
        return null;
      }

      console.log('Returning user profile:', user);
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  async verifyToken(@Req() req: any) {
    try {
      const user = await this.userService.findOne(req.user.sub);
      return { 
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          accessGranted: user.accessGranted
        }
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false };
    }
  }

  @Post('login/password')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' }
      },
      required: ['email', 'password']
    }
  })
  async loginWithPassword(@Body() credentials: { email: string; password: string }) {
    try {
      return await this.authService.loginWithCredentials(
        credentials.email,
        credentials.password
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
        name: { type: 'string', example: 'John Doe' }
      },
      required: ['email', 'password', 'name']
    }
  })
  async register(@Body() userData: { email: string; password: string; name: string }) {
    try {
      await this.userService.createWithPassword(userData);
      return { message: 'User registered successfully' };
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
} 