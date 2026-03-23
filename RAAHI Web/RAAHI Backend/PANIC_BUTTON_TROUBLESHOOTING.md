# 🚨 Panic Button Troubleshooting Guide

## 🔍 Quick Diagnosis

Your panic button wasn't working due to several issues that have been **FIXED**:

### ❌ Issues Found & ✅ Fixed:
1. **Undefined `getFirebaseDB()` function** → Fixed with proper Firebase service calls
2. **Firebase service initialization problems** → Enhanced error handling and fallback services
3. **Missing error handling** → Added comprehensive error handling and logging

---

## 🚀 How to Test Your Panic Button

### Option 1: Quick Test (Recommended)
```bash
# Run the comprehensive test script
node test-panic-button.js
```

### Option 2: Manual Testing

#### Test Server Connection:
```bash
curl http://localhost:3000/api/health
```

#### Test Firebase Connection:
```bash
curl http://localhost:3000/api/emergency/test-firebase
```

#### Test Panic Button (Simple):
```bash
curl -X POST http://localhost:3000/api/emergency/test-panic \
  -H "Content-Type: application/json"
```

#### Test Real Panic Button:
```bash
curl -X POST http://localhost:3000/api/emergency/panic \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "email": "test@emergency.com",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
    "userAgent": "Test Browser",
    "status": "active"
  }'
```

#### Get Panic Alerts:
```bash
curl http://localhost:3000/api/emergency/panic-alerts?limit=5
```

---

## 🛠️ Fixed Code Changes

### 1. Emergency Routes (`routes/emergency.js`)
- ✅ Fixed undefined `getFirebaseDB()` function 
- ✅ Enhanced Firebase service initialization
- ✅ Added comprehensive error handling
- ✅ Created test endpoint `/test-panic`
- ✅ Improved Firebase connection testing

### 2. New Test Endpoints Added:
- `POST /api/emergency/test-panic` - Simple panic test (no auth required)
- `GET /api/emergency/test-firebase` - Enhanced Firebase connection test

---

## 🔧 Common Issues & Solutions

### Issue: "Firebase services unavailable"
**Solution:**
1. Check your `.env` file has Firebase credentials
2. Ensure Firebase Admin SDK is initialized
3. Verify server has proper Firebase configuration

### Issue: "getFirebaseDB is not a function"
**Status:** ✅ **FIXED** - Replaced with proper Firebase service calls

### Issue: Panic alerts not saving
**Solution:**
1. Check Firebase Firestore rules allow writes
2. Verify network connectivity to Firebase
3. Check server console for detailed error messages

### Issue: Location validation errors
**Solution:**
Ensure panic button requests include valid location:
```javascript
{
  "location": {
    "latitude": 28.6139,  // Must be a number
    "longitude": 77.2090  // Must be a number
  }
}
```

---

## 📊 Panic Button Endpoints

### 🚨 Main Panic Endpoint
```
POST /api/emergency/panic
Content-Type: application/json
Authorization: Bearer <token> (optional - works for anonymous users)

Body:
{
  "location": {
    "latitude": number (required),
    "longitude": number (required)
  },
  "email": "string (optional)",
  "timestamp": "ISO string (optional)",
  "userAgent": "string (optional)",
  "status": "active|resolved (optional, default: active)"
}

Response:
{
  "success": true,
  "message": "Panic alert sent successfully",
  "alertId": "panic_123456789_abc123",
  "userId": "user_or_anonymous_id",
  "location": { "latitude": 28.6139, "longitude": 77.2090 },
  "firestorePath": "users/{userId}/panic_alerts/{alertId}"
}
```

### 📋 Get Alerts Endpoint
```
GET /api/emergency/panic-alerts?limit=50&status=active
Authorization: Bearer <token> (optional)

Response:
{
  "success": true,
  "alerts": [...],
  "count": number,
  "source": "Firebase Admin Firestore"
}
```

### 🧪 Test Endpoints
```
POST /api/emergency/test-panic - Simple test (no auth required)
GET /api/emergency/test-firebase - Firebase connection test
```

---

## 🔥 Firebase Structure

Panic alerts are saved in Firebase Firestore with this structure:
```
users/
  {userId}/
    panic_alerts/
      {alertId}/
        - latitude: number
        - longitude: number
        - timestamp: timestamp
        - userId: string
        - userEmail: string
        - userName: string
        - status: 'active' | 'resolved' | 'false_alarm' | 'in_progress'
        - resolved: boolean
        - userAgent: string
        - isAnonymous: boolean
        - alertId: string
```

---

## 🎯 Next Steps

1. **Start your server:** `npm start`
2. **Run the test:** `node test-panic-button.js`
3. **Check results** - all tests should pass now!

### If tests still fail:
1. Check Firebase credentials in `.env`
2. Verify server is running on correct port
3. Check console for error messages
4. Ensure network connectivity

---

## 📞 Emergency Features Available

✅ **Anonymous panic alerts** - No login required  
✅ **Location tracking** - GPS coordinates saved  
✅ **Firebase integration** - Real-time data storage  
✅ **Status updates** - Mark alerts as resolved  
✅ **Alert retrieval** - Get all panic alerts  
✅ **User identification** - Both authenticated and anonymous users  
✅ **Error handling** - Comprehensive error responses  

---

**🚨 Your panic button should now be working correctly!**

Run `node test-panic-button.js` to verify everything is working.