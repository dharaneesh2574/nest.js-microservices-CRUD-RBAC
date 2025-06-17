import { Body, Controller, Get, Post, Put, Delete, Param, Headers, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: any, @Request() req: any) {
    return this.usersService.createUser(createUserDto, req.user);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.usersService.getAllUsers(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.usersService.getUserById(id, req.user);
  }

  @Get('username/:username')
  findByUsername(@Param('username') username: string, @Request() req: any) {
    return this.usersService.getUserByUsername(username, req.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any, @Request() req: any) {
    return this.usersService.updateUser(id, updateUserDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.usersService.deleteUser(id, req.user);
  }

  @Get(':userId/audit-logs')
  getUserAuditLogs(@Param('userId') userId: string, @Request() req: any) {
    return this.usersService.getUserAuditLogs(userId, req.user);
  }

  @Get('audit-logs/all')
  getAllAuditLogs(@Request() req: any) {
    return this.usersService.getAllAuditLogs(req.user);
  }
} 