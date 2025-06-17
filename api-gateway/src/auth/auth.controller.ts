// src/auth/auth.controller.ts
import { Body, Controller, Post, Headers, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: any) {
    return this.authService.signup(body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('validate')
  validate(@Headers('authorization') authHeader: string) {
    // Extract token from Authorization header
    if (!authHeader) {
      throw new BadRequestException('Authorization header is required');
    }

    // Check if it starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Authorization header must start with "Bearer "');
    }

    // Extract the actual token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new BadRequestException('Token is required');
    }

    return this.authService.validate(token);
  }
}
