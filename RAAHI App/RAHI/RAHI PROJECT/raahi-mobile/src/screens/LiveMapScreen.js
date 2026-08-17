import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InfoCard from '../components/InfoCard';
import SafetyZoneMap from '../components/SafetyZoneMap';
import useLiveLocation from '../hooks/useLiveLocation';
import { apiService } from '../services/api';
import colors from '../theme/colors';

export default function LiveMapScreen({ navigation }) {
  const { location, status, error } = useLiveLocation(true);
  const [matches, setMatches] = useState([]);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    let active = true;

    const loadContext = async () => {
      const [nextDestinations, nextMatches] = await Promise.all([
        apiService.getDestinations(),
        location ? apiService.checkGeofences(location) : Promise.resolve([])
      ]);

      if (!active) return;
      setDestinations(nextDestinations.slice(0, 3));
      setMatches(nextMatches);
    };

    loadContext();
    return () => {
      active = false;
    };
  }, [location?.latitude, location?.longitude]);

  return (
    <ScreenShell>
      <TopBar
        title="Live Map"
        subtitle="Current location, safe zones, and nearby highlights"
        onMenuPress={() => navigation.openDrawer()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <InfoCard eyebrow="Location feed" title="Realtime tourist position">
        <Text style={styles.status}>{status}</Text>
        {location ? (
          <Text style={styles.coordinates}>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <SafetyZoneMap location={location} />
      </InfoCard>

      <InfoCard eyebrow="Geofence matches" title="Nearby zones">
        {matches.length ? matches.map((match) => (
          <View key={match.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{match.name}</Text>
              <Text style={styles.meta}>
                {match.type} · {match.distance}m away · radius {match.radius}m
              </Text>
            </View>
            <View style={[styles.swatch, { backgroundColor: match.color || colors.primary }]} />
          </View>
        )) : <Text style={styles.muted}>No active geofence match yet. Move around or enable location updates.</Text>}
      </InfoCard>

      <InfoCard eyebrow="Nearby places" title="Suggested destinations">
        {destinations.map((destination) => (
          <View key={destination.id} style={styles.row}>
            <View style={styles.destinationCopy}>
              <Text style={styles.name}>{destination.name}</Text>
              <Text style={styles.meta}>
                {destination.location} · Safety {destination.safetyRating}
              </Text>
            </View>
          </View>
        ))}
      </InfoCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  status: {
    color: colors.text,
    fontWeight: '700'
  },
  coordinates: {
    color: colors.textMuted
  },
  error: {
    color: colors.danger
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  name: {
    color: colors.text,
    fontWeight: '700'
  },
  meta: {
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 20
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 8
  },
  destinationCopy: {
    flex: 1
  },
  muted: {
    color: colors.textMuted
  }
});
