import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuditService, AuditLogData } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('🔍 AuditInterceptor: Intercepting request...');
    
    const contextType = context.getType();
    console.log('🔍 Context type:', contextType);
    
    // Only handle RPC (microservice) contexts for this interceptor
    if (contextType !== 'rpc') {
      console.log('🔍 Not an RPC context, skipping audit logging');
      return next.handle();
    }

    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();
    const pattern = rpcContext.getContext();

    console.log('🔍 RPC Pattern:', pattern);
    console.log('🔍 RPC Data:', JSON.stringify(data, null, 2));

    // Extract command from TcpContext
    let command: string | undefined;
    
    try {
      if (pattern && pattern.args && pattern.args[1]) {
        const commandJson = JSON.parse(pattern.args[1]);
        command = commandJson.cmd;
      }
    } catch (error) {
      console.log('🔍 Could not parse command from pattern:', error.message);
    }

    console.log('🔍 Extracted command:', command);

    // Define read-only operations that should be excluded from audit logging
    const readOnlyOperations = [
      'get_all_users',
      'get_user_by_id', 
      'get_user_by_username',
      'get_audit_logs'
    ];

    // Skip audit logging for read-only operations
    if (!command || readOnlyOperations.includes(command)) {
      console.log('🔍 Read-only operation or no command - skipping audit logging');
      return next.handle();
    }

    // Extract user information and request data
    const user = data.user;
    const requestData = { ...data };
    delete requestData.user; // Remove user from payload for logging

    console.log('🔍 User context:', user);

    // Map RPC commands to audit actions (only for data-changing operations)
    const actionMap: Record<string, string> = {
      'create_user': 'CREATE_USER',
      'update_user': 'UPDATE_USER',
      'delete_user': 'DELETE_USER',
    };

    const action = command ? actionMap[command] : undefined;
    console.log('🔍 Mapped action:', action);
    
    // Only log if we have a valid action and user context
    if (!action || !user) {
      console.log('🔍 No action mapped or no user context - skipping audit logging');
      return next.handle();
    }

    // Determine target user ID based on the action
    let targetUserId: string | undefined;
    if (data.id) {
      targetUserId = data.id;
    } else if (data.createUserDto) {
      targetUserId = 'NEW_USER'; // Will be updated after creation
    }

    console.log('🔍 Target user ID:', targetUserId);

    const startTime = Date.now();

    return next.handle().pipe(
      tap((result) => {
        console.log('✅ Request completed successfully, logging audit...');
        
        // Log successful action
        const auditData: AuditLogData = {
          performedById: user.id,
          performedByRole: user.role,
          targetUserId: targetUserId === 'NEW_USER' && result?.user?.id ? result.user.id : targetUserId,
          action: action as any,
          payload: this.sanitizePayload(requestData),
          result: this.sanitizeResult(result),
          success: true,
        };

        console.log('🔍 Audit data to be logged:', JSON.stringify(auditData, null, 2));

        this.auditService.logAction(auditData).then(() => {
          console.log('✅ Audit log stored successfully');
        }).catch((error) => {
          console.error('❌ Failed to store audit log:', error);
        });

        console.log(`✅ Audit Log: ${user.username} (${user.role}) performed ${action} on user ${targetUserId} at ${new Date().toISOString()}`);
      }),
      catchError((error) => {
        console.log('❌ Request failed, logging audit...');
        
        // Log failed action
        const auditData: AuditLogData = {
          performedById: user.id,
          performedByRole: user.role,
          targetUserId,
          action: action as any,
          payload: this.sanitizePayload(requestData),
          success: false,
          errorMessage: error.message || 'Unknown error',
        };

        console.log('🔍 Failed audit data to be logged:', JSON.stringify(auditData, null, 2));

        this.auditService.logAction(auditData).then(() => {
          console.log('✅ Failed audit log stored successfully');
        }).catch((logError) => {
          console.error('❌ Failed to store failed audit log:', logError);
        });

        console.log(`❌ Audit Log: ${user.username} (${user.role}) failed to perform ${action} on user ${targetUserId} - Error: ${error.message}`);

        return throwError(() => error);
      })
    );
  }

  private sanitizePayload(payload: any): any {
    if (!payload) return null;
    
    const sanitized = { ...payload };
    
    // Remove sensitive information from payload
    if (sanitized.password) {
      sanitized.password = '[REDACTED]';
    }
    if (sanitized.createUserDto?.password) {
      sanitized.createUserDto.password = '[REDACTED]';
    }
    if (sanitized.updateUserDto?.password) {
      sanitized.updateUserDto.password = '[REDACTED]';
    }
    
    return sanitized;
  }

  private sanitizeResult(result: any): any {
    if (!result) return null;
    
    const sanitized = { ...result };
    
    // Remove sensitive information from result
    if (sanitized.user?.password) {
      delete sanitized.user.password;
    }
    if (sanitized.users) {
      sanitized.users = sanitized.users.map((user: any) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    }
    
    return sanitized;
  }
} 