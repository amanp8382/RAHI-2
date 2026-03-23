# 🚨 INVALID API KEY - Fix Required

## Current Issue
Your API key is **INVALID**: `AIzaSyADEiIWsJZyPAYwzejIFIP8AIzaSyADEiIWsJZyPAYwzejIFIP8-e_EHesQRVE`

**Problems:**
- ❌ Length: 67 characters (should be 39)
- ❌ Appears duplicated/corrupted during copy/paste
- ❌ Google Maps API returns `InvalidKey` error

## 🔧 HOW TO GET A VALID API KEY

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. Create a new project or select existing one

### Step 2: Enable Required APIs
1. Go to **"APIs & Services"** → **"Library"**
2. Search and click **"ENABLE"** for each:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Geolocation API**

### Step 3: Create API Key
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. **Copy the key immediately** (it should be exactly 39 characters)

### Step 4: Restrict the API Key (Important!)
1. Click on the newly created API key
2. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Enable only the APIs you need:
     - Maps JavaScript API
     - Geocoding API
     - Geolocation API

3. Under **"Website restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add these referrers:
     - `http://localhost:5173/*`
     - `https://localhost:5173/*`
     - `http://localhost:3000/*`

### Step 5: Enable Billing (REQUIRED!)
1. Go to **"Billing"**
2. Link a billing account
3. **Note:** You get $200 free credits monthly

## 🎯 What a Valid API Key Looks Like

```
✅ VALID: AIzaSyBdVl-cGz1fq0vEqOWnOyN4EFGH...
   - Exactly 39 characters
   - Starts with "AIza"
   - Contains letters, numbers, hyphens, underscores
```

## 🔄 Update Your .env File

Once you get the valid API key, replace it in your `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyYOUR_NEW_VALID_39_CHARACTER_KEY_HERE
```

## 🧪 Test the New Key

After updating:
1. **Restart your development server**: `npm run dev`
2. **Refresh your browser**
3. **Check console**: Should see no `InvalidKey` warnings
4. **Map should load**: Interactive Google Maps will appear

## ⏱️ Time Required
- Getting new API key: 5-10 minutes
- Setting up billing: 2-3 minutes
- **Total: ~15 minutes**

## 🆘 If You Still Have Issues

1. **Double-check key length** (must be exactly 39 characters)
2. **Verify billing is enabled**
3. **Check API restrictions** (make sure Maps JavaScript API is enabled)
4. **Wait 5-10 minutes** after creating key (propagation time)

## 🔗 Quick Links
- [Google Cloud Console](https://console.cloud.google.com/)
- [Maps JavaScript API](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com)
- [Geocoding API](https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com)

---

**Note:** The current key in your .env appears to be corrupted. You'll need to get a fresh one from Google Cloud Console.