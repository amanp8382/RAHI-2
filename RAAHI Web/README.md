# RAAHI Web Application - Backend & Frontend Integration

This project consists of a React frontend and Node.js/Express backend for the RAAHI tourist safety application.

## Project Structure

```
RAAHI Web/
├── RAAHI Backend/          # Node.js/Express API server
│   ├── controllers/        # API controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/           # Configuration files
│   └── server.js         # Main server file
│
└── RAAHI Frontend/        # React application
    ├── src/
    │   ├── components/    # React components
    │   ├── contexts/      # React contexts (Auth)
    │   ├── services/      # API services
    │   ├── utils/         # Utility functions
    │   └── main.jsx       # Main React entry point
    ├── public/           # Static files
    └── vite.config.js    # Vite configuration
```

## Backend Features

- **Authentication**: JWT-based authentication with registration and login
- **User Management**: User profiles, preferences, and security
- **Safety Features**: Emergency alerts, panic button, location services
- **AI Integration**: Chatbot and safety recommendations
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, rate limiting, input validation

## Frontend Features

- **React 19**: Modern React with hooks and context
- **Authentication**: JWT token management with context
- **Responsive Design**: Mobile-first responsive design
- **Real-time Features**: Panic button, chatbot integration
- **State Management**: React Context for global state
- **HTTP Client**: Axios with interceptors and error handling

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd "RAAHI Backend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3000

   # Database
   MONGODB_URI=mongodb://localhost:27017/raahi-db
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Firebase (optional)
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY=your-firebase-private-key
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   The backend will start on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd "RAAHI Frontend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   The `.env` file is already created with default values:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   NODE_ENV=development
   VITE_APP_NAME=RAAHI - Tourist Safety App
   VITE_APP_VERSION=1.0.0
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:5173`

## API Integration Features

### Authentication System
- **Login**: Multi-user type login (Tourist/Police/Department)
- **Registration**: Complete tourist registration with KYC
- **Token Management**: Automatic token refresh and logout
- **Protected Routes**: Auth context protecting sensitive pages

### API Services
- **Centralized API Client**: Single axios instance with interceptors
- **Error Handling**: User-friendly error messages and retry logic
- **Loading States**: Loading indicators for all API operations
- **Auto-retry**: Automatic retry for failed network requests

### Real-time Features
- **Panic Button**: Location-based emergency alerts to backend
- **Chatbot**: AI-powered assistance through backend API
- **Safety Alerts**: Real-time safety notifications
- **Location Services**: GPS integration for safety features

## Testing the Integration

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd "RAAHI Backend"
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd "RAAHI Frontend"
npm run dev
```

### 2. Test Authentication Flow

1. **Registration**:
   - Navigate to `http://localhost:5173`
   - Click on Registration
   - Fill out the multi-step registration form
   - Submit and verify account creation

2. **Login**:
   - Navigate to `http://localhost:5173/login.html`
   - Test different user types (Tourist/Police/Department)
   - Verify token storage and redirect to dashboard

3. **Dashboard**:
   - After login, verify dashboard loads user data
   - Test logout functionality

### 3. Test Interactive Features

1. **Panic Button**: Click to test emergency API call
2. **Chatbot**: Open and test AI responses
3. **Navigation**: Test all page transitions
4. **Error Handling**: Test with backend offline

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Emergency
- `POST /api/emergency/panic` - Trigger panic alert
- `GET /api/emergency/contacts` - Get emergency contacts

### AI Services
- `POST /api/ai/chatbot` - Chatbot responses
- `POST /api/ai/safety-recommendations` - Safety recommendations

### Alerts
- `GET /api/alerts` - Get safety alerts
- `POST /api/alerts` - Create safety alert

## Development Notes

### Frontend Configuration
- **Vite Proxy**: Configured to proxy `/api` calls to backend
- **React Router**: Setup for navigation between components
- **Auth Context**: Global authentication state management
- **Error Boundaries**: Graceful error handling

### Backend Configuration
- **CORS**: Configured for frontend origin
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive input sanitization
- **Error Handling**: Structured error responses

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for `http://localhost:5173`
2. **Database Connection**: Verify MongoDB is running and accessible
3. **Port Conflicts**: Ensure ports 3000 (backend) and 5173 (frontend) are available
4. **Environment Variables**: Check all required env vars are set

### Debugging

- Backend logs available in terminal
- Frontend errors in browser dev tools
- Network requests in browser Network tab
- API responses in browser console

## Production Deployment

### Backend
- Set `NODE_ENV=production`
- Use process manager (PM2)
- Configure reverse proxy (nginx)
- Setup SSL certificates

### Frontend
- Build with `npm run build`
- Serve static files with web server
- Update API base URL for production
- Configure domain and SSL

## Next Steps

1. **Database Migration**: Setup production MongoDB
2. **Error Monitoring**: Integrate error tracking (Sentry)
3. **Testing**: Add unit and integration tests
4. **Documentation**: API documentation with Swagger
5. **Deployment**: CI/CD pipeline setup