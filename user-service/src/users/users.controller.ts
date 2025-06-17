import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'create_user' })
  create(data: { createUserDto: CreateUserDto; user?: any }) {
    return this.usersService.create(
      data.createUserDto, 
      data.user?.role, 
      data.user?.id, 
      data.user?.username
    );
  }

  @MessagePattern({ cmd: 'get_all_users' })
  findAll(data: { user: any }) {
    return this.usersService.findAll(data.user.role, data.user.id);
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  findOne(data: { id: string; user: any }) {
    return this.usersService.findOne(data.id, data.user.role, data.user.id);
  }

  @MessagePattern({ cmd: 'get_user_by_username' })
  findByUsername(data: { username: string; user: any }) {
    return this.usersService.findByUsername(data.username, data.user.role, data.user.id);
  }

  @MessagePattern({ cmd: 'update_user' })
  update(data: { id: string; updateUserDto: UpdateUserDto; user: any }) {
    return this.usersService.update(
      data.id, 
      data.updateUserDto, 
      data.user.role, 
      data.user.id, 
      data.user.username
    );
  }

  @MessagePattern({ cmd: 'delete_user' })
  remove(data: { id: string; user: any }) {
    return this.usersService.remove(
      data.id, 
      data.user.role, 
      data.user.id, 
      data.user.username
    );
  }

  @MessagePattern({ cmd: 'get_user_audit_logs' })
  getUserAuditLogs(data: { userId: string; user: any }) {
    return this.usersService.getUserAuditLogs(data.userId, data.user.role, data.user.id);
  }

  @MessagePattern({ cmd: 'get_all_audit_logs' })
  getAllAuditLogs(data: { user: any }) {
    return this.usersService.getAllAuditLogs(data.user.role);
  }
} 