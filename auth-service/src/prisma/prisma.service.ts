import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Context interface for audit logging
interface AuditContext {
  initiatorId?: string;
  initiatorUsername?: string;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private basePrisma: PrismaClient;
  
  // Extended Prisma client with audit logging
  public client: any;

  constructor() {
    this.basePrisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        },
      },
    });

    // Extend Prisma with audit logging for User model - Override default methods
    this.client = this.basePrisma.$extends({
      name: 'auditLogger',
      model: {
        user: {
          // Override the default create method
          async create<T>(this: any, args: T & { auditContext?: AuditContext }): Promise<any> {
            const { auditContext, ...createArgs } = args as any;
            
            // Perform the original create operation using the base Prisma client
            const user = await this.$parent.user.create(createArgs);
            
            // Log the action if audit context is provided - simplified logging
            if (auditContext?.initiatorId) {
              await this.$parent.auditLog.create({
                data: {
                  action: 'CREATE',
                  tableName: 'users',
                  recordId: user.id,
                  initiatedBy: auditContext.initiatorId,
                  initiatorUsername: auditContext.initiatorUsername,
                  recordData: { action: 'User created via auth' }
                }
              });
            }

            return user;
          },

          // Override the default update method
          async update<T>(this: any, args: T & { auditContext?: AuditContext }): Promise<any> {
            const { auditContext, ...updateArgs } = args as any;
            
            // Perform the original update operation using the base Prisma client
            const updatedUser = await this.$parent.user.update(updateArgs);
            
            // Log the action if audit context is provided - simplified logging
            if (auditContext?.initiatorId) {
              await this.$parent.auditLog.create({
                data: {
                  action: 'UPDATE',
                  tableName: 'users',
                  recordId: updatedUser.id,
                  initiatedBy: auditContext.initiatorId,
                  initiatorUsername: auditContext.initiatorUsername,
                  recordData: { action: 'User updated via auth' }
                }
              });
            }

            return updatedUser;
          },

          // Override the default delete method
          async delete<T>(this: any, args: T & { auditContext?: AuditContext }): Promise<any> {
            const { auditContext, ...deleteArgs } = args as any;
            
            // Perform the original delete operation using the base Prisma client
            const deletedUser = await this.$parent.user.delete(deleteArgs);
            
            // Log the action if audit context is provided - simplified logging
            if (auditContext?.initiatorId) {
              await this.$parent.auditLog.create({
                data: {
                  action: 'DELETE',
                  tableName: 'users',
                  recordId: deletedUser.id,
                  initiatedBy: auditContext.initiatorId,
                  initiatorUsername: auditContext.initiatorUsername,
                  recordData: { action: 'User deleted via auth' }
                }
              });
            }

            return deletedUser;
          }
        }
      }
    });
  }

  // Proxy methods to access the extended client
  get user() {
    return this.client.user;
  }

  get auditLog() {
    return this.client.auditLog;
  }

  // Direct access to extended client
  get $() {
    return this.client;
  }

  async onModuleInit() {
    try {
      this.logger.log('Connecting to database...');
      await this.client.$connect();
      this.logger.log('Successfully connected to database with audit logging extensions');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.client.$disconnect();
  }
} 