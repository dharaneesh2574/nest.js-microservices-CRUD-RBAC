import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}

  createUser(data: any, user?: any) {
    return this.client.send({ cmd: 'create_user' }, { createUserDto: data, user });
  }

  getAllUsers(user: any) {
    return this.client.send({ cmd: 'get_all_users' }, { user });
  }

  getUserById(id: string, user: any) {
    return this.client.send({ cmd: 'get_user_by_id' }, { id, user });
  }

  getUserByUsername(username: string, user: any) {
    return this.client.send({ cmd: 'get_user_by_username' }, { username, user });
  }

  updateUser(id: string, updateUserDto: any, user: any) {
    return this.client.send({ cmd: 'update_user' }, { id, updateUserDto, user });
  }

  deleteUser(id: string, user: any) {
    return this.client.send({ cmd: 'delete_user' }, { id, user });
  }

  getAuditLogs(user: any, targetUserId?: string, action?: string, limit?: number, offset?: number) {
    return this.client.send({ cmd: 'get_audit_logs' }, { 
      user, 
      targetUserId, 
      action, 
      limit: limit || 100, 
      offset: offset || 0 
    });
  }
} 