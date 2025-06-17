// src/auth/auth.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  signup(data: any) {
    return this.client.send({ cmd: 'signup' }, data);
  }

  login(data: any) {
    return this.client.send({ cmd: 'login' }, data);
  }

  validate(token: string) {
    return this.client.send({ cmd: 'validate' }, { token });
  }
}
