import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogData {
  performedById: string;
  performedByRole: 'USER' | 'ADMIN';
  targetUserId?: string;
  action: 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER';
  payload?: any;
  result?: any;
  success?: boolean;
  errorMessage?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {
    console.log('🔍 AuditService initialized');
  }

  async logAction(data: AuditLogData): Promise<void> {
    console.log('🔍 AuditService.logAction called with data:', JSON.stringify(data, null, 2));
    
    try {
      const auditLogEntry = {
        performedById: data.performedById,
        performedByRole: data.performedByRole,
        targetUserId: data.targetUserId,
        action: data.action,
        payload: data.payload ? JSON.parse(JSON.stringify(data.payload)) : null,
        result: data.result ? JSON.parse(JSON.stringify(data.result)) : null,
        success: data.success !== undefined ? data.success : true,
        errorMessage: data.errorMessage,
      };

      console.log('🔍 Creating audit log entry:', JSON.stringify(auditLogEntry, null, 2));

      const createdLog = await this.prisma.auditLog.create({
        data: auditLogEntry,
      });

      console.log('✅ Audit log created successfully with ID:', createdLog.id);
    } catch (error) {
      console.error('❌ Failed to log audit action:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
  }

  async getAuditLogs(
    userId?: string,
    action?: string,
    limit: number = 100,
    offset: number = 0
  ) {
    console.log('🔍 AuditService.getAuditLogs called with:', { userId, action, limit, offset });
    
    const where: any = {};
    
    if (userId) {
      where.OR = [
        { performedById: userId },
        { targetUserId: userId }
      ];
    }
    
    if (action) {
      where.action = action;
    }

    try {
      const logs = await this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      });

      console.log('✅ Retrieved', logs.length, 'audit logs');
      return logs;
    } catch (error) {
      console.error('❌ Failed to retrieve audit logs:', error);
      throw error;
    }
  }
} 