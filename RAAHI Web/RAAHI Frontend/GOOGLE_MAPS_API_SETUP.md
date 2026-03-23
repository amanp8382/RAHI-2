# Google Maps API Setup Guide

## ❌ Current Issue
The Google Maps API key is **valid** but **not authorized** to use the required services.

**Error:** `This API key is not authorized to use this service or API.`

## 🔧 Required APIs to Enable

Your tourist dashboard needs the following Google Maps APIs to be enabled:

1. **Maps JavaScript API** - For displaying the interactive map
2. **Geocoding API** - For converting addresses to coordinates
3. **Geolocation API** - For finding user location
4. **Places API** (Optional) - For enhanced location data

## 📝 Step-by-Step Fix

### 1. Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (or create a new one)

### 2. Enable Required APIs
1. Go to **APIs & Services** → **Library**
2. Search for and enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Geolocation API**
   - **Places API** (recommended)

### 3. Configure API Key Restrictions
1. Go to **APIs & Services** → **Credentials**
2. Click on your API key: `AIzaSyAR9zdcNvCpMXI56sVqAnpwErXqYvo2E28`
3. Under **API restrictions**:
   - Select "Restrict key"
   - Enable these APIs:
     - Maps JavaScript API
     - Geocoding API
     - Geolocation API
     - Places API

### 4. Set Website Restrictions (Recommended)
1. Under **Website restrictions**:
   - Add `localhost:5173` (for development)
   - Add `localhost:3000` (if using different port)
   - Add your production domain when deployed

### 5. Verify Billing is Enabled
1. Go to **Billing** in Google Cloud Console
2. Ensure billing is enabled (required for Maps API usage)
3. Google provides $200 monthly credit which covers typical development usage

## 🧪 Test After Configuration

### Option 1: Use our diagnostic component
1. The `MapAPITester` component is temporarily added to your dashboard
2. It will show detailed test results

### Option 2: Use the standalone test page
Open `test-map.html` in your browser to see detailed API tests.

### Option 3: Manual API Test
```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Delhi&key=YOUR_API_KEY"
```

## 💰 Cost Information

- **Free tier**: $200 credit per month
- **Maps JavaScript API**: $7 per 1,000 loads
- **Geocoding API**: $5 per 1,000 requests
- **Typical development usage**: Usually stays within free tier

## 🚨 Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables** (✅ You're already doing this)
3. **Restrict API key usage** to specific APIs and domains
4. **Monitor usage** regularly in Google Cloud Console

## 📋 Current Configuration Status

- ✅ **API Key Present**: Yes (`AIzaSyAR9zdcNvCpMXI56sVqAnpwErXqYvo2E28`)
- ✅ **Key Format**: Valid (39 characters, starts with 'AIza')
- ❌ **APIs Enabled**: Need to enable required APIs
- ❌ **Authorization**: Currently denied

## 🎯 Expected Outcome After Fix

Once you enable the required APIs, your map should:
1. ✅ Load the Google Maps interface
2. ✅ Show tourist attractions in Delhi
3. ✅ Allow "Find My Location" functionality  
4. ✅ Display InfoWindow popups for attractions
5. ✅ Support all map controls (zoom, street view, etc.)

## 🔗 Quick Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [API Key Best Practices](https://developers.google.com/maps/api-key-best-practices)