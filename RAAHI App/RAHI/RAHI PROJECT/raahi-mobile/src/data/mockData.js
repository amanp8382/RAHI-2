export const fallbackDestinations = [
  {
    id: 'dest_red_fort',
    name: 'Delhi Red Fort',
    location: 'Delhi, India',
    category: 'Historical',
    rating: 4.2,
    safetyRating: 4.0,
    description: 'Historic fortified palace and UNESCO World Heritage Site.',
    isPublic: true
  },
  {
    id: 'dest_goa_beach',
    name: 'Goa Beaches',
    location: 'Goa, India',
    category: 'Beach',
    rating: 4.5,
    safetyRating: 4.3,
    description: 'Popular shoreline destinations with active tourism services.',
    isPublic: true
  },
  {
    id: 'dest_kerala',
    name: 'Kerala Backwaters',
    location: 'Kerala, India',
    category: 'Nature',
    rating: 4.7,
    safetyRating: 4.5,
    description: 'Calm waterways, houseboats, and scenic nature routes.',
    isPublic: true
  }
];

export const fallbackSafetyTips = [
  { id: 'tip_1', title: 'Stay Connected', description: 'Keep your phone charged and share your route with someone you trust.' },
  { id: 'tip_2', title: 'Use Verified Transport', description: 'Prefer registered taxis or verified ride-sharing services.' },
  { id: 'tip_3', title: 'Respect Local Guidance', description: 'Follow local customs, timings, and official advisories.' }
];

export const fallbackGeofences = [
  { id: 'geo_1', name: 'Central Tourist Hub', latitude: 28.6139, longitude: 77.209, radius: 1500, color: '#1f8a83', type: 'safe_zone' },
  { id: 'geo_2', name: 'Crowded Transit Zone', latitude: 28.6328, longitude: 77.2197, radius: 900, color: '#bb3f3f', type: 'caution_zone' },
  { id: 'geo_3', name: '24x7 Help Point', latitude: 28.6205, longitude: 77.2282, radius: 700, color: '#b88b67', type: 'support_zone' }
];

export const fallbackEmergencyContacts = [
  { id: 'em_1', name: 'National Emergency', phone: '112', type: 'Emergency' },
  { id: 'em_2', name: 'Tourist Helpline', phone: '1363', type: 'Tourism' },
  { id: 'em_3', name: 'Ambulance', phone: '108', type: 'Medical' }
];

export const fallbackPanicHistory = [
  {
    id: 'panic_hist_1',
    status: 'resolved',
    userName: 'Traveler',
    userEmail: 'traveler@raahi.app',
    latitude: 28.6139,
    longitude: 77.209,
    timestampFormatted: new Date(Date.now() - 86400000).toISOString()
  }
];

export const fallbackChatReply = (message) => ({
  success: true,
  source: 'local-fallback',
  message: `RAAHI Assistant fallback: stay in populated areas, keep your route shared, and double-check local transport options before you head out. You asked: "${message}".`,
  timestamp: new Date().toISOString()
});

export const fallbackEmergencyAssistance = ({ location, emergencyType }) => ({
  success: true,
  emergencyType,
  location,
  immediateActions: [
    'Move to a safer public area if you can do so quickly.',
    'Call 112 for emergency support.',
    'Notify one trusted contact with your current location.',
    'Keep your phone unlocked and volume on.'
  ],
  emergencyNumbers: {
    national: '112',
    police: '100',
    ambulance: '108',
    touristHelpline: '1363'
  },
  source: 'local-fallback',
  timestamp: new Date().toISOString()
});

export const fallbackGeofenceMatches = (location) => {
  if (!location?.latitude || !location?.longitude) {
    return [];
  }

  return [
    {
      id: 'geo_match_1',
      name: 'Central Tourist Hub',
      type: 'safe_zone',
      distance: 380,
      radius: 1500,
      color: '#1f8a83'
    }
  ];
};
