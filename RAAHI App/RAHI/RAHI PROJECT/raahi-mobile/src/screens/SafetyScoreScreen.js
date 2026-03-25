import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InfoCard from '../components/InfoCard';
import useLiveLocation from '../hooks/useLiveLocation';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import colors from '../theme/colors';

export default function SafetyScoreScreen({ navigation }) {
  const { user } = useAuth();
  const { location, status, error: locationError } = useLiveLocation(true);
  const [prediction, setPrediction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!location) return;

      try {
        setIsSubmitting(true);
        setError('');
        const response = await apiService.getLiveSafetyScore({
          lat: location.latitude,
          lng: location.longitude,
          locationName: ''
        });
        setPrediction(response.prediction);
      } catch (requestError) {
        setError(apiService.toUserMessage(requestError, 'Unable to fetch safety score.'));
      } finally {
        setIsSubmitting(false);
      }
    };

    fetchPrediction();
  }, [location?.latitude, location?.longitude]);

  const score = prediction?.score ?? 0;
  const tone = score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.danger;

  return (
    <ScreenShell>
      <TopBar
        title="Safety Score"
        subtitle="Live ML prediction from your current location"
        onMenuPress={() => navigation.openDrawer()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <LinearGradient colors={['#1d857e', '#155b57']} style={styles.hero}>
        <Text style={styles.eyebrow}>Live prediction</Text>
        <Text style={styles.scoreLabel}>{prediction?.label || 'Waiting for ML model'}</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>{prediction?.score ?? '--'}</Text>
          <Text style={styles.scoreUnit}>/100</Text>
        </View>
        <Text style={styles.summary}>
          {prediction?.summary || 'As soon as GPS updates arrive, the backend will run your trained model and return the safety result here.'}
        </Text>
      </LinearGradient>

      <InfoCard eyebrow="Status" title="Live context">
        <MetaRow label="Location status" value={status} />
        <MetaRow label="Resolved area" value={prediction?.resolvedLocationName || user?.destination || 'Waiting for result'} />
        <MetaRow label="Threat level" value={prediction?.threatLevel || 'Pending'} />
        <MetaRow label="Model confidence" value={prediction?.confidence ? `${Math.round(prediction.confidence * 100)}%` : 'Pending'} />
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${score}%`, backgroundColor: tone }]} />
        </View>
      </InfoCard>

      {(locationError || error) ? (
        <InfoCard eyebrow="Attention" title="Issue detected" tone="accent">
          <Text style={styles.errorText}>{locationError || error}</Text>
        </InfoCard>
      ) : null}

      <InfoCard eyebrow="Model factors" title="Prediction breakdown">
        {isSubmitting && !prediction ? <ActivityIndicator color={colors.primary} /> : null}
        {prediction?.factors?.length ? prediction.factors.map((factor) => (
          <View key={factor.label} style={styles.factorItem}>
            <View>
              <Text style={styles.factorLabel}>{factor.label}</Text>
              <Text style={styles.factorValue}>{factor.value}</Text>
            </View>
            <Text style={styles.factorImpact}>{factor.impact || 'neutral'}</Text>
          </View>
        )) : <Text style={styles.muted}>Prediction factors will appear here.</Text>}
      </InfoCard>

      <InfoCard eyebrow="Guidance" title="Recommended actions">
        {prediction?.recommendations?.length ? prediction.recommendations.map((item) => (
          <View key={item} style={styles.recommendationRow}>
            <View style={styles.dot} />
            <Text style={styles.recommendationText}>{item}</Text>
          </View>
        )) : <Text style={styles.muted}>Model recommendations will appear here.</Text>}
      </InfoCard>
    </ScreenShell>
  );
}

function MetaRow({ label, value }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    padding: 22,
    gap: 8
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    color: '#ccebe7',
    fontWeight: '700',
    fontSize: 12
  },
  scoreLabel: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff'
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff'
  },
  scoreUnit: {
    fontSize: 20,
    fontWeight: '700',
    color: '#d8f3e6',
    marginBottom: 8
  },
  summary: {
    color: '#e6f5f2',
    lineHeight: 22,
    fontSize: 15
  },
  metaRow: {
    gap: 4
  },
  metaLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSoft
  },
  metaValue: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22
  },
  track: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#ece3db',
    overflow: 'hidden',
    marginTop: 8
  },
  fill: {
    height: '100%',
    borderRadius: 999
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#efe4d9'
  },
  factorLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text
  },
  factorValue: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4
  },
  factorImpact: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 6
  },
  recommendationText: {
    flex: 1,
    color: colors.text,
    lineHeight: 22
  },
  muted: {
    color: colors.textMuted
  },
  errorText: {
    color: colors.danger,
    lineHeight: 22
  }
});
