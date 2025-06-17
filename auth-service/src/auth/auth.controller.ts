import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
    constructor( private readonly authService: AuthService) {}
    @MessagePattern({ cmd: 'signup'})
    signup(data: any){
        return this.authService.signup(data);
    }

    @MessagePattern({ cmd: 'login'})
    login(data: any){
        return this.authService.login(data);
    }
    
    @MessagePattern({ cmd: 'validate'})
    validate(data: any){
        return this.authService.validateToken(data);
    }
}
