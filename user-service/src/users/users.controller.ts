import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { AuditService } from '../audit/audit.service';

@Controller()
@UseInterceptors(AuditInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService
  ) {}

  @MessagePattern({ cmd: 'create_user' })
  create(data: { createUserDto: CreateUserDto; user?: any }) {
    return this.usersService.create(data.createUserDto, data.user?.role);
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
    return this.usersService.update(data.id, data.updateUserDto, data.user.role, data.user.id);
  }

  @MessagePattern({ cmd: 'delete_user' })
  remove(data: { id: string; user: any }) {
    return this.usersService.remove(data.id, data.user.role, data.user.id);
  }

  @MessagePattern({ cmd: 'get_audit_logs' })
  async getAuditLogs(data: { 
    user: any; 
    targetUserId?: string; 
    action?: string; 
    limit?: number; 
    offset?: number 
  }) {
    // Only admins can view all audit logs, users can only view their own
    if (data.user.role !== 'ADMIN') {
      return this.auditService.getAuditLogs(data.user.id, data.action, data.limit, data.offset);
    }

    return this.auditService.getAuditLogs(data.targetUserId, data.action, data.limit, data.offset);
  }
} 