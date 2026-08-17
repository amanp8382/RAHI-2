# RAAHI APP - Tourist Safety Mobile Application

## Project Overview

Develop a **React Native mobile application** for the RAAHI platform that provides tourists with comprehensive safety features, real-time location tracking, and AI-powered recommendations. The app will integrate with the existing RAAHI Web backend (Node.js/Express) using the same MongoDB database, allowing tourists to login with their web credentials and access all tourist-specific features seamlessly.

---

## Frontend Technology Stack

- **Mobile Framework**: React Native (Expo or Bare React Native)
- **State Management**: Redux Toolkit / Context API
- **Navigation**: React Navigation (with native stack and bottom tab navigation)
- **HTTP Client**: Axios with interceptors for API calls
- **Real-time Updates**: Firebase Realtime Database + Cloud Messaging
- **Maps**: React Native Maps (Google Maps or Apple Maps)
- **Location Tracking**: React Native Geolocation Service + react-native-background-geolocation
- **Authentication**: JWT token management (stored in Secure Storage)
- **UI Framework**: React Native Paper / Native Base
- **Styling**: React Native StyleSheet + custom themes
- **Storage**: React Native AsyncStorage + MMKV (for secure token storage)
- **Push Notifications**: Firebase Cloud Messaging
- **Permissions**: React Native Permissions

---

## Backend Technology Stack

- **Framework**: Node.js with Express.js
- **Database**: MongoDB (Atlas) - Shared with RAAHI Web
- **Real-time Database**: Firebase Realtime Database
- **Cloud Messaging**: Firebase Cloud Messaging
- **Authentication**: JWT (JSON Web Tokens)
- **API Security**: Helmet.js, CORS, Rate Limiting
- **Validation**: Express Validator
- **AI/ML Service**: Google Gemini API / Hugging Face
- **File Upload**: Multer
- **Environment Management**: dotenv
- **Logging**: Winston or Bunyan
- **Deployment**: Vercel / Railway / Render

---

## Core Features

### 1. **Authentication & Authorization**
- **Login with Web Credentials**: Tourists login using the same email/password as RAAHI Web
- **Registration**: New users can create accounts with email verification
- **JWT Token Management**: Secure token storage in mobile secure storage
- **Profile Setup**: First-time setup with travel preferences
- **Session Management**: Auto-logout after inactivity, token refresh
- **Password Reset**: Email-based password recovery

**Database**: Share MongoDB User collection with RAAHI Web
**API Endpoints**:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/auth/me` - Get current user profile
  - `PUT /api/auth/profile` - Update profile
  - `PUT /api/auth/password` - Change password
  - `POST /api/auth/logout` - User logout

---

### 2. **Live Location & Real-time Map**
- **Live Location Tracking**: Real-time GPS tracking with high accuracy
- **Live Map Display**: Show user's current location on interactive map
- **Location History**: Visual trail of user's journey
- **Nearby Destinations Map**: Display tourist destinations on map with markers
- **Emergency Location Sharing**: Automatically send location during panic alert
- **Geofence Proximity Alerts**: Notify user when entering/leaving safe zones
- **Background Location Updates**: Continue tracking even when app is closed (with user consent)
- **Location Pin Drop**: Allow users to mark and save important locations

**Technology**: 
  - React Native Maps with Google Maps API
  - React Native Geolocation Service for position updates
  - react-native-background-geolocation for background tracking
  - Firebase Realtime Database for real-time updates

**Features**:
  - Update location every 5-30 seconds (configurable)
  - Store location history in Firebase
  - Show live location marker with user avatar
  - Display animated route polyline
  - Map clustering for multiple destinations

---

### 3. **Panic Button & Emergency Alerts**
- **One-Tap Panic Button**: Prominent, easy-to-access emergency button
- **Automated Emergency Alert**: Instantly alert emergency contacts
- **Location Share**: Send real-time location to emergency services
- **Audio/Visual Alert**: Sound and vibration alerts when triggered
- **Emergency Contact Management**: Add, edit, delete emergency contacts (phone, email, local authorities)
- **Alert History**: View previous panic button activations
- **Alert Status**: Track alert resolution and response
- **Geographic Alert Zones**: Different response protocols for different regions

**Database Models**: 
  - PanicAlert collection in MongoDB
  - Emergency contacts in User model
  - Firestore collection: `users/{uid}/panic_alerts`

**API Endpoints**:
  - `POST /api/emergency/panic` - Trigger panic alert
  - `GET /api/emergency/contacts` - Get emergency contacts
  - `POST /api/emergency/contacts` - Add emergency contact
  - `PUT /api/emergency/contacts/:id` - Update emergency contact
  - `DELETE /api/emergency/contacts/:id` - Delete emergency contact
  - `GET /api/emergency/history` - Get alert history

---

### 4. **Geofencing & Safe Zone Management**
- **Create Geofences**: Mark safe tourist zones with radius
- **Enter/Exit Alerts**: Get notified when entering/leaving geofences
- **Safe Zone Recommendations**: App suggests popular safe tourist areas
- **Custom Safe Zones**: Users can create personal safe zones
- **Color-coded Zones**: Different colors for different safety levels
- **Zone Details**: View facilities, opening hours, safety ratings in each zone
- **Pre-built Tourist Safe Zones**: Hardcoded popular tourist destinations

**Database**: 
  - Geofences collection in MongoDB
  - Firebase Real-time triggers

**API Endpoints**:
  - `POST /api/geofences` - Create geofence
  - `GET /api/geofences` - Get all geofences
  - `GET /api/geofences/:id` - Get geofence details
  - `PUT /api/geofences/:id` - Update geofence
  - `DELETE /api/geofences/:id` - Delete geofence
  - `GET /api/geofences/nearby` - Get nearby geofences

---

### 5. **Destinations & Tourism Information**
- **Browse Destinations**: View popular tourist destinations with details
- **Destination Details**: Images, ratings, reviews, opening hours, pricing
- **Safety Ratings**: AI-generated safety scores for each destination
- **Reviews & Ratings**: Tourist reviews with star ratings
- **Categories**: Filter by type (Historical, Beach, Adventure, Nature, etc.)
- **Nearby Destinations**: Find destinations near current location
- **Favorites**: Save favorite destinations for quick access
- **Search**: Full-text search for destinations
- **Directions**: Get directions to destination using native maps

**Database**: 
  - Destinations collection in MongoDB (shared with RAAHI Web)
  - Reviews collection linked to destinations

**API Endpoints**:
  - `GET /api/destinations` - List all destinations
  - `GET /api/destinations/:id` - Get destination details
  - `GET /api/destinations/nearby` - Get nearby destinations
  - `POST /api/destinations/:id/reviews` - Add review
  - `GET /api/destinations/:id/reviews` - Get reviews
  - `POST /api/destinations/:id/favorites` - Add to favorites
  - `DELETE /api/destinations/:id/favorites` - Remove from favorites

---

### 6. **AI-Powered Safety Chatbot**
- **24/7 Chat Support**: Ask safety-related questions anytime
- **Real-time Responses**: Instant AI-powered answers using Google Gemini API
- **Travel Recommendations**: Get personalized travel suggestions
- **Safety Tips**: Real-time safety advice based on location and time
- **Multi-language Support**: Chat in different languages
- **Chat History**: Save and review previous conversations
- **Emergency Quick Access**: Easy escalation to human support
- **Context-aware Responses**: Chatbot understands user's location and preferences

**Technology**: 
  - Google Gemini API for AI responses
  - Firebase Cloud Firestore for chat storage
  - Real-time message streaming

**API Endpoints**:
  - `POST /api/ai/chat` - Send chat message
  - `GET /api/ai/chat-history` - Get chat history
  - `POST /api/ai/recommendations` - Get personalized recommendations

---

### 7. **Safety Score & Risk Assessment**
- **Live Safety Score**: Real-time safety rating for current location (0-100)
- **Area Risk Level**: Low/Medium/High/Critical indicators
- **Safety Metrics**: Based on historical data, time of day, incidents
- **Crime Information**: General safety information for areas (if available)
- **Weather Alerts**: Include weather warnings that affect safety
- **Event Alerts**: Notify about events, protests, or congestion
- **Risk Heatmap**: Visual representation of safer vs. riskier areas
- **Personal Safety Tips**: Contextual tips based on current location and time

**API Endpoints**:
  - `GET /api/ai/safety-score` - Get safety score for location
  - `GET /api/ai/safety-insights` - Get detailed safety insights
  - `POST /api/ai/training-data` - Submit activity for AI training

---

### 8. **User Profile & Preferences**
- **Profile Information**: Name, email, phone, profile picture
- **Travel Preferences**: Interests (adventure, culture, food, shopping, etc.)
- **Trip Plans**: Save upcoming trips with dates and destinations
- **Activity History**: Track visited destinations
- **Preferences Management**: Language, notifications, privacy settings
- **Document Storage**: Store travel documents (passport, booking confirmations)
- **Travel Badges**: Gamification with achievement badges

**Database**: 
  - User collection (shared with RAAHI Web)
  - AITrainingData collection for preferences

**API Endpoints**:
  - `GET /api/users/profile` - Get user profile
  - `PUT /api/users/profile` - Update profile
  - `GET /api/users/activity` - Get activity history
  - `POST /api/users/activity` - Add activity
  - `GET /api/users/trips` - Get trip plans
  - `POST /api/users/trips` - Create trip plan

---

### 9. **Push Notifications**
- **Safety Alerts**: Notify about nearby emergencies or incidents
- **Geofence Alerts**: Notifications when entering/exiting zones
- **Event Notifications**: Important travel or safety-related events
- **Personalized Recommendations**: Destination and activity suggestions
- **Chat Notifications**: New messages from support or chatbot
- **Itinerary Reminders**: Remind about planned activities
- **Weather Warnings**: Severe weather alerts
- **App Updates**: Important feature updates and security patches

**Technology**: Firebase Cloud Messaging (FCM)

---

### 10. **Offline Functionality**
- **Offline Map**: Download map regions for offline use
- **Cached Destinations**: Access previously viewed destinations offline
- **Local Storage**: Store important information locally
- **Sync on Connection**: Auto-sync changes when internet returns
- **Battery Optimization**: Efficient background location tracking

---

### 11. **Settings & Privacy**
- **Location Privacy**: Control who can see real-time location
- **Notification Preferences**: Manage notification types and frequency
- **Data Sharing**: Privacy controls for data collection
- **Emergency Contact Visibility**: Control emergency contact access
- **Account Security**: Two-factor authentication option
- **Data Export**: Download personal data
- **Account Deletion**: GDPR-compliant account deletion

**API Endpoints**:
  - `PUT /api/users/settings` - Update settings
  - `GET /api/users/privacy` - Get privacy settings
  - `POST /api/users/2fa` - Enable two-factor authentication

---

### 12. **Emergency Services Integration**
- **Quick Call**: One-tap calling to emergency numbers (police, ambulance)
- **Location Auto-fill**: Automatically include location in emergency calls
- **Hospital Finder**: Find nearest hospitals/clinics on map
- **Police Station Locator**: Find nearby police stations
- **Emergency Services Directory**: Important contact numbers by region

---

## Database Schema (Shared with RAAHI Web)

### Collections:
1. **Users**
   - Basic profile information
   - Travel preferences
   - Activity history
   - Emergency contacts
   - Geofences
   - Trip plans
   - Firebase UID mapping

2. **Destinations**
   - Name, location, category
   - Ratings, reviews count
   - Safety ratings
   - Operating hours
   - Pricing information
   - Images

3. **AITrainingData**
   - User interactions
   - Destination visits
   - Safety feedback
   - Preferences data

4. **PanicAlerts** (Firebase Firestore)
   - Alert ID, timestamp
   - User location
   - Status (active/resolved)
   - Emergency contacts notified

---

## User Flow

### First-time Tourist:
1. Download app → Register/Login (same credentials as web) → Setup travel preferences
2. Allow location permissions → View home dashboard with safety info
3. Browse nearby geofences and destinations
4. Explore map with real-time location
5. Save favorite destinations and set emergency contacts

### Returning Tourist:
1. Quick login → Dashboard loads instantly
2. See live location on map
3. Browse recommendations based on preferences
4. Check nearby attractions and safety scores
5. Access chat for quick questions

### Emergency Scenario:
1. User feels unsafe → One-tap panic button
2. App automatically collects location
3. Alert sent to emergency contacts with live location link
4. Firebase notification to authorities (if connected)
5. User can cancel or update status
6. Alert logged in history

---

## API Structure

```
Base URL: http://localhost:3000/api

Authentication:
- Header: Authorization: Bearer {jwt_token}

Response Format:
{
  "success": true/false,
  "data": {...},
  "message": "...",
  "error": "..."
}
```

---

## Security Requirements

- **HTTPS Only**: All API communication encrypted
- **JWT Expiration**: Token expires in 7 days, refresh available
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Prevent abuse (100 requests/15 minutes)
- **CORS**: Configured for mobile app domain
- **Data Encryption**: Sensitive data encrypted at rest
- **Secure Storage**: Tokens stored in secure phone storage
- **Permission Management**: Request only necessary permissions

---

## Deployment

### Backend:
- Deploy Express server on Vercel, Railway, or Render
- MongoDB Atlas for database
- Firebase project for real-time features
- Environment variables for sensitive keys

### Mobile App:
- iOS: TestFlight for beta, App Store for production
- Android: Internal testing, Google Play Console for production
- Expo or EAS Build for automated builds

---

## Performance Optimization

- **Code Splitting**: Lazy load screens and components
- **Image Optimization**: Compress and cache images
- **API Caching**: Cache frequently accessed data
- **Background Tasks**: Efficient background location tracking
- **Memory Management**: Proper cleanup and garbage collection
- **Network Optimization**: Minimize API calls, batch requests
- **Battery Optimization**: Reduce location update frequency when idle

---

## Testing Strategy

- **Unit Tests**: Jest for business logic
- **Component Tests**: React Native Testing Library
- **E2E Tests**: Detox for mobile app
- **API Tests**: Postman/Jest for backend
- **Load Tests**: Artillery for stress testing backend
- **Security Tests**: OWASP testing guidelines

---

## Monitoring & Analytics

- **Crash Reporting**: Sentry or Firebase Crashlytics
- **Performance Monitoring**: Firebase Performance Monitoring
- **User Analytics**: Firebase Analytics
- **Error Logging**: Winston for server logs
- **API Monitoring**: Response time tracking

---

## Phase-wise Development

### Phase 1: Foundation (Weeks 1-2)
- Project setup and configuration
- Authentication implementation
- Basic user profile screens
- API integration setup

### Phase 2: Core Features (Weeks 3-4)
- Live map implementation
- Panic button functionality
- Geofencing system
- Destinations browsing

### Phase 3: Advanced Features (Weeks 5-6)
- AI chatbot integration
- Safety score calculation
- Push notifications
- Emergency services integration

### Phase 4: Polish & Optimization (Weeks 7-8)
- UI/UX refinements
- Performance optimization
- Testing and bug fixes
- Deployment to stores

---

## Exclusions

- ❌ Police Login Page
- ❌ Authority/Admin Dashboard
- ❌ Tourist Department Admin Features
- ❌ Government Official Features

---

## Success Metrics

- App launches successfully on both iOS and Android
- Users can login with same credentials as web
- Live location updates in real-time (< 5-second latency)
- Panic button triggers instantly
- All API endpoints functional and tested
- < 50MB app size
- < 3-second cold start time
- 99% uptime for backend services
- Positive user reviews (4.5+ stars)

---

## Additional Notes

- The app is **tourist-focused** with emphasis on safety and convenience
- All features must work seamlessly with existing RAAHI Web infrastructure
- Users should have consistent experience across web and mobile
- Offline-first approach where possible
- Accessibility features (dark mode, text sizing, screen readers)
- Comprehensive error handling and user feedback
- Regular updates with bug fixes and new features
