export const hasValidCoordinates = (location) => (
  Number.isFinite(location?.lat) && Number.isFinite(location?.lng)
  && location.lat >= -90 && location.lat <= 90
  && location.lng >= -180 && location.lng <= 180
);

export const isRecentLocation = (location, now = Date.now()) => {
  const timestamp = Date.parse(location?.updatedAt);
  const age = now - timestamp;
  return hasValidCoordinates(location) && Number.isFinite(timestamp) && age >= 0 && age <= 120000;
};
