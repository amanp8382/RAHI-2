// 🚧 BACKEND GEOFENCES CONFIGURATION
// Add your latitude, longitude, and radius directly here!

const HARDCODED_GEOFENCES = [
  {
    id: 'red-fort-zone',
    name: 'Red Fort Safe Zone',
    latitude: 28.6562,
    longitude: 77.2410,
    radius: 300, // meters
    color: '#ff0000',
    type: 'safe',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'india-gate-zone',
    name: 'India Gate Monitoring',
    latitude: 28.6129,
    longitude: 77.2295,
    radius: 200, // meters
    color: '#ff0000',
    type: 'monitoring',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lotus-temple-zone',
    name: 'Lotus Temple Area',
    latitude: 28.5535,
    longitude: 77.2588,
    radius: 150, // meters
    color: '#ff0000',
    type: 'restricted',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // 👇 ADD YOUR OWN GEOFENCES HERE 👇
  /*
  {
    id: 'my-custom-zone',
    name: 'My Custom Zone',
    latitude: 28.6000,  // 👈 CHANGE THIS
    longitude: 77.2000, // 👈 CHANGE THIS
    radius: 500,        // 👈 CHANGE THIS (meters)
    color: '#ff0000',
    type: 'monitoring',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  */
];

// Function to get all hardcoded geofences
const getHardcodedGeofences = () => {
  return HARDCODED_GEOFENCES.filter(g => g.isActive);
};

// Function to check if a location is within any hardcoded geofence
const checkLocationInHardcodedGeofences = (latitude, longitude) => {
  const matches = [];
  
  HARDCODED_GEOFENCES.forEach(geofence => {
    if (!geofence.isActive) return;
    
    const distance = calculateDistance(
      latitude,
      longitude,
      geofence.latitude,
      geofence.longitude
    );
    
    if (distance <= geofence.radius) {
      matches.push({
        ...geofence,
        distance: Math.round(distance)
      });
    }
  });
  
  return matches;
};

// Utility function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = {
  HARDCODED_GEOFENCES,
  getHardcodedGeofences,
  checkLocationInHardcodedGeofences
};