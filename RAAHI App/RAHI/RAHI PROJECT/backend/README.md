# RAAHI Backend API

A secure backend server for the RAAHI safety mobile application, built with Node.js, Express, and
MongoDB.

## 🚀 Features

- **Authentication**: JWT-based user registration and login
- **Profile Management**: Complete user profile and settings management
- **Emergency Reporting**: Incident reporting system
- **Security**: Rate limiting, CORS, input validation, and secure password hashing
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository** (if not already done)
2. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
    - Copy `.env` file and update the values:
   ```bash
   cp .env .env.local
   ```
    - Update the MongoDB URI and JWT secret in `.env.local`

5. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

6. **Run the server**:
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## 🌐 API Endpoints

### Base URL

- **Local**: `http://localhost:3000/api`
- **Android Emulator**: `http://10.0.2.2:3000/api`

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| GET | `/me` | Get current user info | Yes |
| POST | `/logout` | User logout | Yes |
| PUT | `/change-password` | Change password | Yes |

### Profile Management (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/update` | Update profile info | Yes |
| PUT | `/emergency-contacts` | Update emergency contacts | Yes |
| PUT | `/location-settings` | Update location preferences | Yes |
| PUT | `/notification-settings` | Update notification preferences | Yes |
| GET | `/stats` | Get user statistics | Yes |
| DELETE | `/delete` | Deactivate account | Yes |

### Emergency (`/api/emergency`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/report` | Submit emergency report | Yes |
| GET | `/status/:reportId` | Get report status | Yes |

### System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| GET | `/` | API info | No |

## 📝 API Request Examples

### Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "phone": "+1234567890",
    "address": "123 Main St, City"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Update Profile (requires JWT token)

```bash
curl -X PUT http://localhost:3000/api/profile/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Smith",
    "phone": "+1987654321"
  }'
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login/registration, include
the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🗃️ Database Schema

### User Model

```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  phone: String (optional, valid phone number),
  address: String (optional, max 200 chars),
  profilePicture: String (optional),
  isActive: Boolean (default: true),
  lastLogin: Date,
  emergencyContacts: [
    {
      name: String (required),
      phone: String (required),
      relationship: String (optional)
    }
  ],
  locationSettings: {
    shareLocation: Boolean (default: true),
    emergencyLocationSharing: Boolean (default: true)
  },
  notificationSettings: {
    pushNotifications: Boolean (default: true),
    emailNotifications: Boolean (default: false),
    emergencyAlerts: Boolean (default: true)
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🚦 Response Format

All API responses follow this structure:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    // Validation errors (if applicable)
  ]
}
```

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment | development | No |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/raahi_db | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRE` | JWT expiration time | 7d | No |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 | No |

## 🧪 Testing

```bash
# Run tests
npm test

# Test API health
curl http://localhost:3000/api/health
```

## 📊 Monitoring

- **Health Check**: `GET /api/health`
- **Server Logs**: Console output with structured logging
- **Rate Limiting**: 100 requests per 15 minutes per IP

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **CORS**: Configured for mobile app access
- **Helmet**: Security headers
- **Soft Delete**: User accounts are deactivated, not deleted

## 🚀 Deployment

### Production Setup

1. **Set environment variables**:
   ```bash
   export NODE_ENV=production
   export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/raahi_db
   export JWT_SECRET=your-super-secret-jwt-key
   ```

2. **Install production dependencies**:
   ```bash
   npm ci --only=production
   ```

3. **Start server**:
   ```bash
   npm start
   ```

### Docker (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📞 Support

For issues or questions about the backend API, please refer to the main RAAHI project documentation
or create an issue in the project repository.