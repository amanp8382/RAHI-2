// 🚧 HARDCODED GEOFENCES CONFIGURATION
// Add your latitude, longitude, and radius directly here!

export const GEOFENCES = [
  {
    id: 'red-fort-zone',
    name: 'Red Fort Safe Zone',
    latitude: 28.6562,
    longitude: 77.2410,
    radius: 300, // meters
    color: '#ff0000', // red color
    isActive: true,
    type: 'safe'
  },
  {
    id: 'india-gate-zone',
    name: 'India Gate Monitoring',
    latitude: 28.6129,
    longitude: 77.2295,
    radius: 200, // meters
    color: '#ff0000', // red color
    isActive: true,
    type: 'monitoring'
  },
  {
    id: 'lotus-temple-zone',
    name: 'Lotus Temple Area',
    latitude: 28.5535,
    longitude: 77.2588,
    radius: 150, // meters
    color: '#ff0000', // red color
    isActive: true,
    type: 'restricted'
  },

  // 👇 ADD YOUR OWN GEOFENCES HERE 👇
  // Just copy the format above and change the values:


  {
   id: 'my-zone',
  name: 'My Red Zone',
  latitude: 28.472430,    // Your latitude
  longitude: 77.488703,   // Your longitude
  radius: 50,          // Radius in meters
  color: '#ff0000',     // Red color
  isActive: true,       // Must be true to show
  type: 'monitoring'
  },

];

// 🎨 Available colors for geofences:
export const GEOFENCE_COLORS = {
  RED: '#ff0000',      // 🔴 Red - Restricted zones
  YELLOW: '#f59e0b',   // 🟡 Yellow - Caution zones
  GREEN: '#22c55e',    // 🟢 Green - Safe zones
  BLUE: '#007bff',     // 🔵 Blue - Information zones
  ORANGE: '#fb923c',   // 🟠 Orange - Warning zones
  PURPLE: '#8b5cf6'    // 🟣 Purple - Special zones
};

// 🏷️ Available geofence types:
export const GEOFENCE_TYPES = {
  SAFE: 'safe',
  MONITORING: 'monitoring',
  RESTRICTED: 'restricted',
  EMERGENCY: 'emergency',
  TOURIST: 'tourist'
};