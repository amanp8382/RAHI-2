# 🗺️ Geofencing & Maps Setup Guide

## ✅ **COMPLETE IMPLEMENTATION**

Your RAAHI tourism system now has **full geofencing capabilities** with red circular boundaries on maps!

---

## 🎯 **What's Been Added**

### **1. Tourist Dashboard Map with Geofencing**
- ✅ **Red circles** show geofence boundaries on the map
- ✅ **Interactive controls** to create, edit, and manage geofences
- ✅ **Quick location buttons** for popular tourist spots
- ✅ **Real-time visualization** of all active geofences

### **2. Admin Dashboard with Advanced Maps**
- ✅ **Google Maps integration** with full API key support
- ✅ **Tourist tracking** with color-coded markers
- ✅ **Incident monitoring** on map
- ✅ **Geofence visualization** and management
- ✅ **Multiple map types** (Road, Satellite, Hybrid, Terrain)

### **3. Backend Geofencing API**
- ✅ **Full CRUD operations** for geofences
- ✅ **Location checking** to see if tourists are within boundaries
- ✅ **Firebase integration** for real-time data storage
- ✅ **Distance calculations** and proximity alerts

---

## 🚀 **Setup Instructions**

### **Step 1: Get Google Maps API Key**

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/google/maps-apis
   ```

2. **Enable Required APIs:**
   - Maps JavaScript API
   - Places API
   - Geocoding API

3. **Create API Key:**
   - Click "Create Credentials" → "API Key"
   - Copy your API key (starts with `AIzaSy...`)

### **Step 2: Configure Environment Variables**

**Frontend:** Update `.env.local` file:
```bash
# Replace with your actual Google Maps API key
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxx

# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api
```

**Backend:** Your `.env` is already configured with Firebase!

### **Step 3: Start Your Applications**

**Backend:**
```bash
cd "D:\Smart tourism\Documents\GitHub\rahinew\RAAHI Web\RAAHI Backend"
npm start
```

**Frontend:**
```bash
cd "D:\Smart tourism\Documents\GitHub\rahinew\RAAHI Web\RAAHI Frontend"
npm install
npm run dev
```

---

## 📍 **Where to Enter Latitude, Longitude & Radius**

### **In Tourist Dashboard:**

1. **Go to Dashboard → Map Tab**
2. **Click "Manage Geofences" button** (yellow button on map)
3. **Click "Add Geofence" button**
4. **Enter Details:**
   - **Name:** e.g., "Red Fort Safe Zone"
   - **Latitude:** 28.6562 (or use Quick Locations)
   - **Longitude:** 77.2410
   - **Radius:** 100-10000 meters
   - **Color:** Choose red or any color for the circle

### **Quick Location Buttons Available:**
- 📍 Red Fort (28.6562, 77.2410)
- 📍 India Gate (28.6129, 77.2295) 
- 📍 Lotus Temple (28.5535, 77.2588)
- 📍 Qutub Minar (28.5245, 77.1855)
- 📍 Current Location (auto-detected)

---

## 🔴 **How to See Red Fencing Circles**

### **Tourist Dashboard:**
1. Open **Dashboard**
2. Go to **Map** tab
3. Click **"Manage Geofences"**
4. Create a geofence with **red color (#ff0000)**
5. **Red circle appears immediately** on the map!

### **Admin Dashboard:**
1. Open **AdminMapDashboard** component
2. **Pre-configured geofences** show as colored circles
3. **Red, yellow, and green zones** already visible
4. **Click circles** for geofence information

---

## 📊 **API Endpoints Created**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/geofences` | Create new geofence |
| `GET` | `/api/geofences` | Get all geofences |
| `GET` | `/api/geofences/:id` | Get specific geofence |
| `PUT` | `/api/geofences/:id` | Update geofence |
| `DELETE` | `/api/geofences/:id` | Delete geofence |
| `POST` | `/api/geofences/check` | Check if location is within geofences |

---

## 🧪 **Test Your Geofencing**

### **Create a Test Geofence:**
```bash
curl -X POST http://localhost:3000/api/geofences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Red Zone",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "radius": 500,
    "color": "#ff0000",
    "type": "monitoring"
  }'
```

### **Check Location:**
```bash
curl -X POST http://localhost:3000/api/geofences/check \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 28.6139,
    "longitude": 77.2090
  }'
```

---

## 🎨 **Customization Options**

### **Geofence Colors:**
- 🔴 **Red (#ff0000)** - Restricted zones
- 🟡 **Yellow (#f59e0b)** - Caution zones  
- 🟢 **Green (#22c55e)** - Safe zones
- 🔵 **Blue (#007bff)** - Information zones
- 🟣 **Purple (#8b5cf6)** - Special zones

### **Geofence Types:**
- `monitoring` - General monitoring
- `safe` - Safe zones
- `restricted` - Restricted areas
- `emergency` - Emergency zones
- `tourist` - Tourist-specific areas

### **Radius Options:**
- **Minimum:** 10 meters
- **Maximum:** 10,000 meters (10km)
- **Recommended:** 100-1000 meters for tourist areas

---

## 📱 **Features Available**

### **Tourist Dashboard:**
✅ **Interactive map** with current location  
✅ **Geofence creation** with visual form  
✅ **Red circle visualization** on map  
✅ **Quick location buttons** for easy setup  
✅ **Real-time geofence management**  
✅ **Color-coded zones** for different purposes  

### **Admin Dashboard:**
✅ **Advanced map controls** (Satellite, Hybrid, etc.)  
✅ **Tourist location tracking** with status indicators  
✅ **Incident monitoring** on map  
✅ **Geofence oversight** for all zones  
✅ **Real-time alerts** and notifications  
✅ **Multi-layer visualization**  

### **Backend API:**
✅ **RESTful geofence API** with full CRUD operations  
✅ **Location proximity checking** for alerts  
✅ **Firebase real-time storage**  
✅ **Distance calculations** and geo-queries  
✅ **User authentication** and authorization  
✅ **Comprehensive error handling**  

---

## 🎯 **Next Steps**

1. **Add your Google Maps API key** to `.env.local`
2. **Start both servers** (backend and frontend)
3. **Login to dashboard** and go to Maps tab
4. **Click "Manage Geofences"** button
5. **Create your first red geofence!**

---

## 🆘 **Troubleshooting**

### **Map not loading?**
- Check your Google Maps API key in `.env.local`
- Ensure APIs are enabled in Google Cloud Console
- Verify network connectivity

### **Geofence not saving?**
- Check backend server is running
- Verify Firebase configuration in backend `.env`
- Check browser console for authentication errors

### **Red circles not showing?**
- Ensure geofence is created with `isActive: true`
- Check the color is set (default is red #ff0000)
- Refresh the map or toggle geofence visibility

---

**🎉 Your geofencing system is now fully functional with red circular boundaries on the map!** 

Test it out by creating a geofence around Red Fort and watch the red circle appear on your tourist dashboard map!