import apiService from '../services/api';
import { hasValidCoordinates } from './locationValidation';
let locations = {};
export const updateLiveLocationCache = records => {
  locations = Object.fromEntries(records.filter(record => hasValidCoordinates(record.liveLocation)).map(record => [record.travelerId, record.liveLocation]));
  return locations;
};
export const saveTravelerLiveLocation = async (travelerId, location) => {
  if (!travelerId || !hasValidCoordinates(location)) return null;
  const response = await apiService.travelers.saveLocation({ lat: location.lat, lng: location.lng, accuracy: location.accuracy });
  locations[travelerId] = response.location;
  window.dispatchEvent(new Event('raahi-location-update'));
  return response.location;
};
export const getTravelerLiveLocation = id => locations[id] || null;
export const getAllTravelerLiveLocations = () => locations;

export const clearLocationCache = () => { locations = {}; };
