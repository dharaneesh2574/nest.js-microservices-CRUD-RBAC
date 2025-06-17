import { Body, Controller, Get, Post, Put, Delete, Param, Headers, UseGuards, Request, Query } from '@nestjs/common';
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

  @Get('audit-logs')
  getAuditLogs(
    @Request() req: any,
    @Query('targetUserId') targetUserId?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.usersService.getAuditLogs(
      req.user,
      targetUserId,
      action,
      limit ? parseInt(limit) : undefined,
      offset ? parseInt(offset) : undefined
    );
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
} 