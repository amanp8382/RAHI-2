# Google Maps Integration Setup Guide

This guide will help you set up Google Maps integration in your RAAHI tourist dashboard.

## 📋 Prerequisites

1. A Google Cloud Platform (GCP) account
2. A project in Google Cloud Console
3. Billing enabled (Google Maps requires billing, but has generous free tier)

## 🔧 Step 1: Get Google Maps API Key

### 1.1 Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 1.2 Create or Select a Project
- If you don't have a project, click "Create Project"
- Give it a name like "RAAHI Tourism App"
- Click "Create"

### 1.3 Enable Required APIs
Navigate to APIs & Services > Library and enable these APIs:
- **Maps JavaScript API** (required)
- **Geocoding API** (for address lookup)
- **Places API** (optional, for enhanced location search)
- **Geolocation API** (optional, for better location services)

### 1.4 Create API Key
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. Click "Restrict Key" for security

### 1.5 Restrict Your API Key (Recommended)
1. Under "Application restrictions":
   - Choose "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:3000/*` for development)
2. Under "API restrictions":
   - Select "Restrict key"
   - Choose the APIs you enabled above

## 🔧 Step 2: Configure Your React App

### 2.1 Create Environment File
Create a `.env` file in your frontend root directory:

```bash
# In: D:\Smart tourism\Documents\GitHub\rahinew\RAAHI Web\RAAHI Frontend\.env
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Replace `YOUR_API_KEY_HERE` with your actual Google Maps API key.**

### 2.2 Add .env to .gitignore
Make sure your `.env` file is in `.gitignore`:

```bash
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## 🔧 Step 3: Test the Integration

1. Start your React development server:
   ```bash
   cd "D:\Smart tourism\Documents\GitHub\rahinew\RAAHI Web\RAAHI Frontend"
   npm start
   ```

2. Navigate to your dashboard and click the "Safety Map" tab

3. You should see:
   - A Google Map centered on Delhi
   - Your current location marker (blue dot)
   - Safety zones with colored circles
   - Emergency services markers (red)
   - Tourist attractions markers (blue)

## 🎨 Features Included

### Map Features:
- **User Location Detection**: Automatically centers on user's current location
- **Safety Zones**: Color-coded areas showing safety scores
  - Green: Safe zones (80+ score)
  - Yellow: Moderate safety (50-79 score)  
  - Red: High risk areas (<50 score)
- **Emergency Services**: Hospitals, police stations, fire stations
- **Tourist Attractions**: Major landmarks and points of interest
- **Interactive Info Windows**: Click markers for more details

### Map Controls:
- Zoom controls
- Map type selection (Road/Satellite)
- Street view access
- Fullscreen toggle

## 🔧 Customization Options

### Adding Your Own Data
You can pass custom data to the GoogleMap component:

```jsx
<GoogleMap 
  onLocationUpdate={handleLocationUpdate}
  safetyData={[
    { name: 'Custom Area', lat: 28.6139, lng: 77.2090, safety: 95, color: '#10b981' }
  ]}
  emergencyServices={[
    { name: 'Custom Hospital', lat: 28.6129, lng: 77.2295, type: 'hospital', icon: '🏥' }
  ]}
  touristAttractions={[
    { name: 'Custom Attraction', lat: 28.6141, lng: 77.2295, rating: 4.8, icon: '🏛️' }
  ]}
/>
```

### Styling
Modify `src/styles/google-maps.css` to customize the appearance.

## 🚨 Troubleshooting

### Map Not Loading
1. **Check API Key**: Ensure it's correctly set in `.env`
2. **Check Console**: Look for error messages in browser console
3. **API Restrictions**: Make sure your domain is whitelisted
4. **Billing**: Ensure billing is enabled in Google Cloud

### Location Not Found
1. **HTTPS Required**: Geolocation works only on HTTPS or localhost
2. **Permissions**: User must grant location permission
3. **Fallback**: App uses India Gate as default location

### API Quota Exceeded
- Google Maps has generous free tier (28,000 map loads/month)
- Monitor usage in Google Cloud Console
- Set up billing alerts

## 📊 API Usage Limits (Free Tier)

- **Maps JavaScript API**: 28,000 loads/month free
- **Geocoding API**: 40,000 requests/month free
- **Places API**: Basic data free, details charged

## 🔐 Security Best Practices

1. **Restrict API Keys**: Always restrict by HTTP referrer and API
2. **Environment Variables**: Never commit API keys to version control
3. **Monitor Usage**: Set up alerts for unusual activity
4. **Regular Rotation**: Rotate API keys periodically

## 📱 Mobile Responsiveness

The map is fully responsive and includes:
- Touch-friendly controls
- Responsive legend layout
- Optimized marker sizes
- Mobile-first design

## 🎯 Next Steps

1. **Backend Integration**: Connect to your safety score API
2. **Real-time Updates**: Implement WebSocket for live safety updates
3. **Route Planning**: Add directions and route optimization
4. **Offline Support**: Cache map tiles for offline usage
5. **Analytics**: Track user interactions and popular locations

## 📞 Support

If you encounter issues:
1. Check Google Maps API documentation
2. Review browser console for errors
3. Verify API key permissions
4. Test with a fresh API key if needed

---

**Important**: Keep your API key secure and never expose it in client-side code repositories!