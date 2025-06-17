# NestJS Food Ordering Microservices

A comprehensive microservices architecture built with NestJS, featuring authentication, user management, role-based access control, and audit logging.

## 🏗️ Architecture

This application follows a microservices architecture pattern with the following services:

- **API Gateway** (Port 3000) - Main entry point and request routing
- **Auth Service** (Port 3001) - Authentication and JWT token management
- **User Service** (Port 3002) - User management and audit logging
- **PostgreSQL Database** - Data persistence with Prisma ORM

## 📋 Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control (RBAC)** - USER and ADMIN roles with permissions
- ✅ **User Management** - Complete CRUD operations for users
- ✅ **Audit Logging** - Comprehensive tracking of all data-changing operations
- ✅ **Microservices Communication** - TCP-based inter-service communication
- ✅ **Database Integration** - PostgreSQL with Prisma ORM
- ✅ **Password Security** - Bcrypt hashing for user passwords
- ✅ **Data Validation** - Input validation and sanitization
- ✅ **Error Handling** - Comprehensive error handling and logging

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nestjs-food-ordering
   ```

2. **Install dependencies for all services**
   ```bash
   # API Gateway
   cd api-gateway
   npm install
   
   # Auth Service
   cd ../auth-service
   npm install
   
   # User Service
   cd ../user-service
   npm install
   ```

3. **Database Setup**
   
   Create a PostgreSQL database and update the connection strings in each service:
   
   ```bash
   # In auth-service/.env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_db"
   JWT_SECRET="your-jwt-secret-key"
   
   # In user-service/.env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/user_db"
   ```

4. **Run Prisma migrations**
   ```bash
   # Auth Service
   cd auth-service
   npx prisma migrate dev
   npx prisma generate
   
   # User Service
   cd ../user-service
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start all services**
   ```bash
   # Terminal 1 - Auth Service
   cd auth-service
   npm run start:dev
   
   # Terminal 2 - User Service
   cd user-service
   npm run start:dev
   
   # Terminal 3 - API Gateway
   cd api-gateway
   npm run start:dev
   ```

## 🔧 Service Configuration

### Ports
- API Gateway: `http://localhost:3000`
- Auth Service: `http://localhost:3001`
- User Service: `http://localhost:3002`

### Environment Variables

Create `.env` files in each service directory:

**auth-service/.env**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_db"
JWT_SECRET="your-jwt-secret-key"
```

**user-service/.env**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/user_db"
```

## 📚 API Documentation

### Authentication Endpoints

All authentication requests go through the API Gateway at `http://localhost:3000`

#### Sign Up
```bash
POST /auth/signup
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER" // Optional: "USER" or "ADMIN"
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

### User Management Endpoints

All user management requests require authentication. Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

#### Get All Users (Admin Only)
```bash
GET /users
Authorization: Bearer <token>
```

#### Get User by ID
```bash
GET /users/:id
Authorization: Bearer <token>
```

#### Get User by Username
```bash
GET /users/username/:username
Authorization: Bearer <token>
```

#### Update User
```bash
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "firstName": "UpdatedName",
  "lastName": "UpdatedLastName"
}
```

#### Delete User
```bash
DELETE /users/:id
Authorization: Bearer <token>
```

### Audit Log Endpoints

#### Get Audit Logs
```bash
GET /users/audit-logs
Authorization: Bearer <token>

# Query parameters (optional):
# - performedById: Filter by user who performed the action
# - targetUserId: Filter by target user
# - action: Filter by action type
# - page: Page number (default: 1)
# - limit: Results per page (default: 10)
```

**Example:**
```bash
GET /users/audit-logs?action=UPDATE_USER&page=1&limit=5
```

## 🔐 Role-Based Access Control

### USER Role Permissions
- View their own profile
- Update their own profile
- Delete their own account
- View their own audit logs

### ADMIN Role Permissions
- All USER permissions
- View all users
- Update any user
- Delete any user
- Create new admin users
- View all audit logs

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  email VARCHAR UNIQUE,
  firstName VARCHAR,
  lastName VARCHAR,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performedById UUID NOT NULL,
  performedByRole ENUM('USER', 'ADMIN') NOT NULL,
  targetUserId UUID,
  action ENUM('CREATE_USER', 'UPDATE_USER', 'DELETE_USER') NOT NULL,
  payload JSONB,
  result JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  errorMessage VARCHAR
);
```

## 🛡️ Security Features

- **JWT Token Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **Role-Based Authorization** - Multi-level access control
- **Input Validation** - Comprehensive request validation
- **Audit Logging** - Track all data-changing operations
- **Error Sanitization** - Safe error responses without sensitive data

## 🔍 Monitoring & Logging

The application includes comprehensive audit logging that tracks:
- User creation, updates, and deletions
- Who performed each action
- When the action was performed
- What data was changed
- Success/failure status
- Error messages for failed operations

## 🧪 Testing

Run tests for each service:

```bash
# Auth Service
cd auth-service
npm run test

# User Service
cd user-service
npm run test

# API Gateway
cd api-gateway
npm run test
```

## 🚀 Deployment

### Docker Deployment (Recommended)

1. **Create Docker Compose file**
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:13
       environment:
         POSTGRES_DB: foodordering
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
       ports:
         - "5432:5432"
     
     auth-service:
       build: ./auth-service
       ports:
         - "3001:3001"
       depends_on:
         - postgres
     
     user-service:
       build: ./user-service
       ports:
         - "3002:3002"
       depends_on:
         - postgres
     
     api-gateway:
       build: ./api-gateway
       ports:
         - "3000:3000"
       depends_on:
         - auth-service
         - user-service
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env files
   - Verify database exists and migrations are applied

2. **JWT Token Issues**
   - Ensure JWT_SECRET is set in auth-service/.env
   - Check token format: `Authorization: Bearer <token>`
   - Verify token hasn't expired

3. **Service Communication Errors**
   - Ensure all services are running on correct ports
   - Check TCP configuration in service modules

4. **Permission Denied Errors**
   - Verify user has correct role for the operation
   - Check JWT token contains valid user information

### Logs

Check service logs for detailed error information:
```bash
# Auth Service logs
cd auth-service && npm run start:dev

# User Service logs
cd user-service && npm run start:dev

# API Gateway logs
cd api-gateway && npm run start:dev
```

## 📞 Support

For support, please open an issue on the GitHub repository or contact the development team. 