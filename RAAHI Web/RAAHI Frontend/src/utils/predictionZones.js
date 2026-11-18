export const predictionLocationKey = (location) => `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;

export const classifyPrediction = (prediction, receivedAt, now = Date.now()) => {
  const score = prediction?.score;
  if (!Number.isFinite(score) || score < 0 || score > 100
    || !Number.isFinite(receivedAt) || now < receivedAt || now - receivedAt >= 120000) return null;
  return score >= 60
    ? { color: '#16a34a', label: 'Green zone', score }
    : { color: '#dc2626', label: 'Red zone', score };
};
