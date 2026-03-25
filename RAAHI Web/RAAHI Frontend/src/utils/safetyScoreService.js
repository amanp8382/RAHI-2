const ML_SCORE_KEY = 'raahi_ml_safety_score_v1';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeThreatLevel = (score) => {
  if (score >= 80) return 'Low';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'Elevated';
  return 'High';
};

const buildFallbackModelOutput = ({ location, traveler }) => {
  const hasMedicalRisk = traveler?.medicalConditions && traveler.medicalConditions.toLowerCase() !== 'none';
  const longTrip = Number(traveler?.tripDurationDays || 0) >= 7;
  const poorAccuracyPenalty = location?.accuracy ? Math.min(10, Math.round(location.accuracy / 25)) : 0;

  let score = 84;
  if (hasMedicalRisk) score -= 18;
  if (longTrip) score -= 8;
  score -= poorAccuracyPenalty;
  score = clamp(score, 18, 96);

  return {
    score,
    label: score >= 75 ? 'Safe to travel' : score >= 55 ? 'Stay alert' : 'High caution',
    threatLevel: normalizeThreatLevel(score),
    confidence: location?.lat && location?.lng ? 0.91 : 0.52,
    summary: location?.lat && location?.lng
      ? 'Live location is available and the current zone assessment has been updated.'
      : 'Live location is not available yet, so this is a profile-based estimate.',
    factors: [
      { label: 'Location confidence', value: location?.lat && location?.lng ? 'Live GPS active' : 'Waiting for GPS', impact: location?.lat && location?.lng ? 'positive' : 'neutral' },
      { label: 'Health risk', value: hasMedicalRisk ? traveler.medicalConditions : 'No major condition shared', impact: hasMedicalRisk ? 'negative' : 'positive' },
      { label: 'Trip duration', value: traveler?.tripDurationDays ? `${traveler.tripDurationDays} days` : 'Unknown', impact: longTrip ? 'negative' : 'neutral' },
      { label: 'Destination', value: traveler?.destination || 'Unknown destination', impact: 'neutral' }
    ],
    recommendations: [
      'Keep your phone location enabled while travelling.',
      'Share your QR card only with trusted authorities.',
      hasMedicalRisk ? 'Keep medication and emergency contact details accessible.' : 'Review nearby safe zones before moving.'
    ],
    rawModel: {
      modelName: 'RAAHI Safety Adapter',
      mode: 'fallback',
      latitude: location?.lat ?? null,
      longitude: location?.lng ?? null,
      accuracy: location?.accuracy ?? null
    }
  };
};

export const getSafetyScoreForTraveler = ({ traveler, location }) => {
  try {
    const raw = localStorage.getItem(ML_SCORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.score === 'number') {
        return {
          score: clamp(parsed.score, 0, 100),
          label: parsed.label || 'Model result',
          threatLevel: parsed.threatLevel || normalizeThreatLevel(parsed.score),
          confidence: parsed.confidence ?? null,
          summary: parsed.summary || 'Safety score loaded from ML model payload.',
          factors: Array.isArray(parsed.factors) ? parsed.factors : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          rawModel: parsed
        };
      }
    }
  } catch (error) {
    console.error('Failed to read ML safety payload:', error);
  }

  return buildFallbackModelOutput({ traveler, location });
};
