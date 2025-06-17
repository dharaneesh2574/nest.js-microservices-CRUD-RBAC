import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

const JWT_SECRET = 'my_secret_key';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(data: { username: string; password: string; role?: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      return { error: 'user already exists' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: data.role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
      auditContext: {
        initiatorId: 'SIGNUP_SYSTEM',
        initiatorUsername: 'Signup System'
      }
    });

    return { message: 'user created' };
  }

  async login(data: { username: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return { error: 'Invalid credentials' };
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role 
      },
      JWT_SECRET
    );
    
    return { token };
  }

  validateToken(data: any) {
    try {
      // data should contain the token from the API gateway
      const token = data.token || data;
      
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Return user info without sensitive data
      return { 
        valid: true,
        user: {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role
        },
        message: 'Token is valid'
      };
    } catch (err) {
      // Handle different types of JWT errors for better debugging
      if (err.name === 'TokenExpiredError') {
        return { 
          valid: false, 
          error: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        };
      } else if (err.name === 'JsonWebTokenError') {
        return { 
          valid: false, 
          error: 'Invalid token format',
          code: 'INVALID_TOKEN'
        };
      } else {
        return { 
          valid: false, 
          error: 'Token validation failed',
          code: 'VALIDATION_FAILED'
        };
      }
    }
  }
}
