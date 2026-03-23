# Firebase Authentication Integration

## Overview
This document describes the Firebase Authentication integration with the RAAHI Smart Tourism application.

## Integration Architecture

```
Frontend (React) → Firebase Auth → Backend (Node.js) → MongoDB
```

## Flow

### Registration Process
1. **Frontend**: User fills registration form
2. **Frontend**: Creates Firebase user with email/password
3. **Frontend**: Updates Firebase user profile with display name
4. **Frontend**: Sends email verification
5. **Frontend**: Calls backend API with user data
6. **Backend**: Creates Firebase user record (server-side)
7. **Backend**: Creates MongoDB user record with Firebase UID link
8. **Backend**: Sets custom claims in Firebase for user role
9. **Frontend**: Shows success message with email verification notice

### Login Process
1. **Frontend**: User provides email/password
2. **Frontend**: Signs in with Firebase Auth
3. **Frontend**: Checks if email is verified
4. **Firebase**: Triggers auth state change
5. **Frontend**: Gets Firebase ID token
6. **Frontend**: Sends token to backend for verification
7. **Backend**: Verifies Firebase token and finds MongoDB user
8. **Backend**: Returns JWT token and user data
9. **Frontend**: Stores JWT and user data, sets authenticated state

### Logout Process
1. **Frontend**: Signs out from Firebase
2. **Firebase**: Triggers auth state change
3. **Frontend**: Clears local storage and auth state
4. **Frontend**: Calls backend logout endpoint (optional)

## Key Features

### Dual Authentication System
- **Firebase**: Handles email/password authentication, email verification
- **Backend JWT**: Handles API authorization and user session management

### Automatic Cleanup
- If Firebase user creation succeeds but MongoDB fails, Firebase user is deleted
- If MongoDB creation succeeds but Firebase fails, error is thrown

### Security Features
- Email verification required before login
- Custom claims in Firebase for role-based access
- JWT tokens for API authorization
- Secure password handling

### Error Handling
- Firebase-specific error codes translated to user-friendly messages
- Graceful fallbacks if services are unavailable
- Cleanup mechanisms to prevent orphaned accounts

## Environment Variables

### Backend (.env)
```
FIREBASE_PROJECT_ID=raahi-adf39
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_AUTH_URI=...
FIREBASE_TOKEN_URI=...
FIREBASE_DATABASE_URL=...
JWT_SECRET=...
```

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=AIzaSyAFM8gSCXm4Wu3OxeMWZKjUvg6aMevO-FE
VITE_FIREBASE_AUTH_DOMAIN=raahi-adf39.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=raahi-adf39
VITE_FIREBASE_STORAGE_BUCKET=raahi-adf39.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1086656996206
VITE_FIREBASE_APP_ID=1:1086656996206:web:01689548aab22f5ebf177f
VITE_FIREBASE_DATABASE_URL=https://raahi-adf39-default-rtdb.firebaseio.com
```

## API Endpoints

### New Endpoints Added
- `POST /api/auth/verify-firebase` - Verify Firebase ID token and return JWT

### Modified Endpoints
- `POST /api/auth/register` - Now creates both Firebase and MongoDB users

## Database Schema Updates

### MongoDB User Model
```javascript
{
  // ... existing fields
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  }
}
```

## Testing

### Manual Testing Steps
1. Register a new user
2. Check Firebase Auth console for user creation
3. Check MongoDB for user record with firebaseUid
4. Verify email verification email is sent
5. Test login before email verification (should fail)
6. Verify email and test login again (should succeed)
7. Test logout functionality

### Automated Testing
- Unit tests for auth functions
- Integration tests for Firebase + MongoDB flow
- E2E tests for complete registration/login flow

## Troubleshooting

### Common Issues
1. **Firebase user created but MongoDB fails**: Check MongoDB connection and user schema validation
2. **Email verification not received**: Check Firebase Auth settings and spam folder
3. **Login fails after registration**: Ensure email is verified
4. **CORS errors**: Verify Firebase project configuration matches environment variables

### Debugging
- Check browser console for Firebase errors
- Check backend logs for MongoDB and Firebase Admin SDK errors
- Verify environment variables are correctly set
- Test Firebase connection independently

## Security Considerations

1. **Environment Variables**: Never commit Firebase private keys to version control
2. **Email Verification**: Enforced to prevent fake account creation
3. **Token Expiration**: JWT tokens have expiration, Firebase tokens auto-refresh
4. **Role-based Access**: Custom claims in Firebase mirror MongoDB user roles
5. **Input Validation**: All user inputs validated on both client and server

## Future Enhancements

1. **Password Reset**: Implement Firebase password reset flow
2. **Social Auth**: Add Google/Facebook sign-in options
3. **Multi-factor Auth**: Add phone/SMS verification
4. **Real-time Updates**: Use Firebase Realtime Database for live updates
5. **Push Notifications**: Implement Firebase Cloud Messaging