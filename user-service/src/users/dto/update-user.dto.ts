export class UpdateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
} 