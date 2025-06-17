import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header with Bearer token is required');
    }

    const token = authHeader.substring(7);

    try {
      const response = await firstValueFrom(
        this.authClient.send({ cmd: 'validate' }, { token })
      );

      if (!response.valid) {
        throw new UnauthorizedException('Invalid token');
      }

      // Add user info to request for use in controllers
      request.user = response.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
} 