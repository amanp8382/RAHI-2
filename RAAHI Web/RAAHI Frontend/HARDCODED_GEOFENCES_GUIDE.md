# 🚧 Hardcoded Geofences Setup Guide

## ✅ **SIMPLE APPROACH - Edit Code Directly**

No dashboard needed! Just edit the config files to add your latitude, longitude, and radius.

---

## 📍 **Where to Add Your Coordinates**

### **Frontend (for map display):**
**File:** `src/config/geofences.js`

```javascript
export const GEOFENCES = [
  {
    id: 'red-fort-zone',
    name: 'Red Fort Safe Zone',
    latitude: 28.6562,     // 👈 CHANGE THIS
    longitude: 77.2410,    // 👈 CHANGE THIS
    radius: 300,           // 👈 CHANGE THIS (meters)
    color: '#ff0000',      // red color
    isActive: true,
    type: 'safe'
  },
  
  // ADD MORE GEOFENCES HERE:
  {
    id: 'my-custom-zone',
    name: 'My Custom Zone',
    latitude: 28.6000,     // 👈 YOUR LATITUDE
    longitude: 77.2000,    // 👈 YOUR LONGITUDE  
    radius: 500,           // 👈 YOUR RADIUS (meters)
    color: '#ff0000',      // red color
    isActive: true,
    type: 'monitoring'
  },
];
```

### **Backend (for API and location checking):**
**File:** `config/geofences.js`

```javascript
const HARDCODED_GEOFENCES = [
  {
    id: 'red-fort-zone',
    name: 'Red Fort Safe Zone',
    latitude: 28.6562,     // 👈 CHANGE THIS
    longitude: 77.2410,    // 👈 CHANGE THIS
    radius: 300,           // 👈 CHANGE THIS (meters)
    color: '#ff0000',
    type: 'safe',
    isActive: true
  },
  
  // ADD MORE HERE TOO
];
```

---

## 🔴 **How to See Red Circles on Map**

1. **Edit the config file:** `src/config/geofences.js`
2. **Add your coordinates:**
   ```javascript
   {
     id: 'my-zone',
     name: 'My Red Zone',
     latitude: 28.6139,    // Delhi coordinates
     longitude: 77.2090,   // Delhi coordinates  
     radius: 200,          // 200 meter radius
     color: '#ff0000',     // RED COLOR
     isActive: true,       // MUST be true to show
     type: 'monitoring'
   }
   ```
3. **Save the file**
4. **Refresh your browser** - Red circle appears instantly!

---

## 🚀 **Quick Setup**

### **Step 1: Add Google Maps API Key**
**File:** `.env.local`
```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### **Step 2: Start Servers**
```bash
# Backend
npm start

# Frontend (in new terminal)
npm run dev
```

### **Step 3: View Your Red Zones**
1. Open dashboard → Map tab
2. **Red circles appear automatically!**
3. See zone count in top-right corner

---

## 📊 **Pre-configured Red Zones**

Your system already has **3 red zones** ready:

| Zone | Latitude | Longitude | Radius |
|------|----------|-----------|---------|
| **Red Fort** | 28.6562 | 77.2410 | 300m |
| **India Gate** | 28.6129 | 77.2295 | 200m |  
| **Lotus Temple** | 28.5535 | 77.2588 | 150m |

---

## ✏️ **Add Your Own Zone (Example)**

### **Frontend Config** (`src/config/geofences.js`):
```javascript
export const GEOFENCES = [
  // ... existing zones ...
  
  // 👇 YOUR NEW ZONE
  {
    id: 'my-restaurant-zone',
    name: 'Popular Restaurant Area',
    latitude: 28.6200,     // Your restaurant latitude
    longitude: 77.2100,    // Your restaurant longitude
    radius: 100,           // 100 meter radius
    color: '#ff0000',      // Red color
    isActive: true,        // Show on map
    type: 'monitoring'     // Zone type
  }
];
```

### **Backend Config** (`config/geofences.js`):
```javascript
const HARDCODED_GEOFENCES = [
  // ... existing zones ...
  
  // 👇 YOUR NEW ZONE (same coordinates)
  {
    id: 'my-restaurant-zone',
    name: 'Popular Restaurant Area',
    latitude: 28.6200,
    longitude: 77.2100,
    radius: 100,
    color: '#ff0000',
    type: 'monitoring',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
```

---

## 🎨 **Color Options**

```javascript
color: '#ff0000'  // 🔴 Red (default)
color: '#22c55e'  // 🟢 Green  
color: '#f59e0b'  // 🟡 Yellow
color: '#007bff'  // 🔵 Blue
color: '#8b5cf6'  // 🟣 Purple
```

---

## 🧪 **Test Your Zones**

### **Check if coordinates work:**
```bash
curl -X POST http://localhost:3000/api/geofences/check-hardcoded \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 28.6562,
    "longitude": 77.2410
  }'
```

### **Get all hardcoded zones:**
```bash
curl http://localhost:3000/api/geofences/hardcoded
```

---

## 🔄 **How It Works**

1. **Edit config files** → Add your coordinates
2. **Save files** → Changes take effect immediately  
3. **Refresh browser** → Red circles appear on map
4. **Backend API** → Automatically serves your hardcoded zones

---

## 🎯 **Examples of Good Coordinates**

### **Delhi Tourist Spots:**
```javascript
// Red Fort
{ latitude: 28.6562, longitude: 77.2410, radius: 300 }

// India Gate  
{ latitude: 28.6129, longitude: 77.2295, radius: 200 }

// Lotus Temple
{ latitude: 28.5535, longitude: 77.2588, radius: 150 }

// Qutub Minar
{ latitude: 28.5245, longitude: 77.1855, radius: 250 }

// Humayun's Tomb
{ latitude: 28.5933, longitude: 77.2507, radius: 200 }
```

### **Mumbai Tourist Spots:**
```javascript
// Gateway of India
{ latitude: 18.9220, longitude: 72.8347, radius: 300 }

// Marine Drive
{ latitude: 18.9435, longitude: 72.8235, radius: 500 }

// Chhatrapati Shivaji Terminus  
{ latitude: 18.9401, longitude: 72.8352, radius: 200 }
```

---

## 🆘 **Troubleshooting**

### **Red circles not showing?**
- Check `isActive: true` in config
- Ensure coordinates are numbers, not strings
- Make sure file is saved
- Refresh browser

### **Wrong location?**
- Verify latitude/longitude are correct
- Use Google Maps to get exact coordinates
- Check that you're looking at the right map area

### **API not working?**
- Ensure both frontend and backend config files have same coordinates
- Check backend server is running
- Look for console errors

---

**🎉 That's it! No dashboard needed - just edit the config files and see your red zones on the map instantly!**

**Files to edit:**
- 📁 Frontend: `src/config/geofences.js`
- 📁 Backend: `config/geofences.js`