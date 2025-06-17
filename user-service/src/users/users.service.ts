import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, requestingUserRole?: string, requestingUserId?: string, requestingUsername?: string) {
    // Only admins can create other admins
    if (createUserDto.role === 'ADMIN' && requestingUserRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create admin users');
    }

    // Check if user already exists
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('User with this username or email already exists');
    }

    // Hash password if provided
    let hashedPassword = createUserDto.password;
    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }

    // Use standard create method with audit context
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || 'USER',
      },
      auditContext: {
        initiatorId: requestingUserId || 'SYSTEM',
        initiatorUsername: requestingUsername || 'System'
      }
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, message: 'User created successfully' };
  }

  async findAll(requestingUserRole: string, requestingUserId?: string) {
    // Only admins can view all users
    if (requestingUserRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view all users');
    }

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { users };
  }

  async findOne(id: string, requestingUserRole: string, requestingUserId: string) {
    // Users can only view their own profile, admins can view any profile
    if (requestingUserRole !== 'ADMIN' && requestingUserId !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user };
  }

  async update(id: string, updateUserDto: UpdateUserDto, requestingUserRole: string, requestingUserId: string, requestingUsername?: string) {
    // Users can only update their own profile, admins can update any profile
    if (requestingUserRole !== 'ADMIN' && requestingUserId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Only admins can change roles
    if (updateUserDto.role && requestingUserRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can change user roles');
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check for conflicts if updating username or email
    if (updateUserDto.username || updateUserDto.email) {
      const conflictUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } }, // Exclude current user
            {
              OR: [
                updateUserDto.username ? { username: updateUserDto.username } : {},
                updateUserDto.email ? { email: updateUserDto.email } : {},
              ].filter(obj => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (conflictUser) {
        throw new ConflictException('Username or email already exists');
      }
    }

    // Hash password if provided
    let updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Use standard update method with audit context
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      auditContext: {
        initiatorId: requestingUserId,
        initiatorUsername: requestingUsername
      }
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, message: 'User updated successfully' };
  }

  async remove(id: string, requestingUserRole: string, requestingUserId: string, requestingUsername?: string) {
    // Users can only delete their own account, admins can delete any account
    if (requestingUserRole !== 'ADMIN' && requestingUserId !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Use standard delete method with audit context
    await this.prisma.user.delete({
      where: { id },
      auditContext: {
        initiatorId: requestingUserId,
        initiatorUsername: requestingUsername
      }
    });

    return { message: 'User deleted successfully' };
  }

  async findByUsername(username: string, requestingUserRole: string, requestingUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users can only view their own profile, admins can view any profile
    if (requestingUserRole !== 'ADMIN' && requestingUserId !== user.id) {
      throw new ForbiddenException('You can only view your own profile');
    }

    return { user };
  }

  // Audit log methods (unchanged)
  async getUserAuditLogs(userId: string, requestingUserRole: string, requestingUserId: string) {
    // Users can only view their own audit logs, admins can view any audit logs
    if (requestingUserRole !== 'ADMIN' && requestingUserId !== userId) {
      throw new ForbiddenException('You can only view your own audit logs');
    }

    const auditLogs = await this.prisma.user.getAuditLogs(userId);
    return { auditLogs };
  }

  async getAllAuditLogs(requestingUserRole: string) {
    // Only admins can view all audit logs
    if (requestingUserRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view all audit logs');
    }

    const auditLogs = await this.prisma.user.getAllAuditLogs();
    return { auditLogs };
  }
} 