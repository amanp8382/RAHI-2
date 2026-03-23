const LIVE_LOCATION_KEY = 'raahi_live_locations_v1';

const readStore = () => {
  try {
    const raw = localStorage.getItem(LIVE_LOCATION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to read live locations:', error);
    return {};
  }
};

const writeStore = (value) => {
  localStorage.setItem(LIVE_LOCATION_KEY, JSON.stringify(value));
};

export const saveTravelerLiveLocation = (travelerId, location) => {
  if (!travelerId || !location) return null;

  const store = readStore();
  store[travelerId] = {
    ...location,
    updatedAt: new Date().toISOString()
  };
  writeStore(store);
  return store[travelerId];
};

export const getTravelerLiveLocation = (travelerId) => {
  const store = readStore();
  return store[travelerId] || null;
};

export const getAllTravelerLiveLocations = () => readStore();
