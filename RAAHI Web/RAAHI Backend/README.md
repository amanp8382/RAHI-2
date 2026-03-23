# Smart Tourism Backend

A comprehensive backend API for smart tourism applications, featuring AI-powered recommendations, real-time data processing with Firebase, and robust data storage with MongoDB.

## 🌟 Features

- **Dual Database Architecture**: MongoDB for AI training data and Firebase for real-time features
- **AI/ML Ready**: Comprehensive data models for machine learning and recommendation systems
- **Authentication & Security**: JWT-based auth, rate limiting, and security middleware
- **Real-time Capabilities**: Firebase integration for location tracking, alerts, and live updates
- **Tourism-Focused**: Models for destinations, users, reviews, and travel preferences
- **Production Ready**: Error handling, logging, graceful shutdown, and health checks

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Express API    │    │   Databases     │
│   (React/Vue)   │◄───┤   Server         │────┤   MongoDB +     │
│                 │    │   (Node.js)      │    │   Firebase      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Database Strategy
- **MongoDB**: Stores user profiles, destinations, AI training data, reviews, and structured tourism data
- **Firebase**: Handles real-time location updates, alerts, chat, and live notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account (already configured)
- Firebase project (for real-time features)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo-url>
   cd smart-tourism-backend
   npm install
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update Firebase configuration with your project details
   - MongoDB is already configured with your Atlas connection

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing
   - Generate service account key
   - Update Firebase variables in `.env`

4. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📁 Project Structure

```
smart-tourism-backend/
├── config/
│   ├── database.js      # Database connection manager
│   ├── mongodb.js       # MongoDB configuration
│   └── firebase.js      # Firebase configuration
├── models/
│   ├── User.js          # User schema with travel preferences
│   ├── Destination.js   # Tourism destination schema
│   └── AITrainingData.js # ML training data schema
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── destinations.js  # Destination routes
│   ├── ai.js           # AI recommendation routes
│   └── health.js       # Health check routes
├── middleware/
│   └── errorHandler.js # Global error handling
├── controllers/        # Route controllers (to be implemented)
├── services/          # Business logic services
├── utils/             # Utility functions
├── uploads/           # File upload directory
└── server.js         # Main application entry point
```

## 🗄️ Database Models

### User Model
- Basic profile information
- Travel preferences for AI training
- Activity history tracking
- Location data with geospatial indexing
- Firebase integration for real-time features

### Destination Model
- Comprehensive tourism destination data
- Categories, ratings, and reviews
- Geospatial location data
- Operating hours and pricing
- AI-ready metrics for recommendations

### AI Training Data Model
- User interaction tracking
- Feature vectors for machine learning
- Privacy-compliant data collection
- Training/validation/test set management
- Model performance tracking

## 🔗 API Endpoints

### Base URL: `http://localhost:3000/api`

#### Health & Status
- `GET /health` - Service health check

#### Authentication (Coming Soon)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

#### Users (Coming Soon)
- `GET /users` - Get user profiles
- `PUT /users/:id` - Update user profile
- `GET /users/:id/preferences` - Get travel preferences

#### Destinations (Coming Soon)
- `GET /destinations` - List destinations with filtering
- `GET /destinations/:id` - Get destination details
- `POST /destinations/:id/reviews` - Add review
- `GET /destinations/nearby` - Find nearby destinations

#### AI & Recommendations (Coming Soon)
- `GET /ai/recommendations` - Get personalized recommendations
- `POST /ai/training-data` - Submit interaction data
- `GET /ai/insights` - Get travel insights

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | (configured) |
| `FIREBASE_PROJECT_ID` | Firebase project ID | - |
| `JWT_SECRET` | JWT signing secret | - |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit per window | 100 |

### Security Features
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- JWT authentication
- Request ID tracking

## 🧠 AI/ML Integration

The backend is designed to support machine learning workflows:

1. **Data Collection**: User interactions are automatically tracked
2. **Feature Engineering**: Raw data is processed into ML-ready features
3. **Model Training**: Data can be exported for training recommendation models
4. **Real-time Inference**: API endpoints for serving predictions

### AI Data Flow
```
User Interaction → Feature Extraction → Training Data → ML Model → Recommendations
```

## 🔄 Real-time Features (Firebase)

Firebase handles:
- Live location tracking
- Real-time alerts and notifications
- Chat and messaging features
- Live destination updates
- Emergency notifications

## 📊 Monitoring & Logging

- Request/response logging with Morgan
- Error tracking with unique request IDs
- Health check endpoints
- Database connection monitoring
- Graceful shutdown handling

## 🚢 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```bash
# Build
docker build -t smart-tourism-backend .

# Run
docker run -p 3000:3000 --env-file .env smart-tourism-backend
```

## 🧪 Testing (Coming Soon)

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests
npm run test:integration # Integration tests
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

## Next Steps

To complete the backend setup:

1. **Set up Firebase project** and update `.env` file
2. **Implement authentication routes** with JWT
3. **Create destination management APIs**
4. **Build AI recommendation engine**
5. **Add real-time features** with Firebase
6. **Implement file upload** for images
7. **Add comprehensive testing**
8. **Set up CI/CD pipeline**

The foundation is ready - now let's build amazing travel experiences! 🌍✈️