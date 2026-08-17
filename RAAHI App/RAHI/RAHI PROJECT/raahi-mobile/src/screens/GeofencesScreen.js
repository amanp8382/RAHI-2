import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InfoCard from '../components/InfoCard';
import useLiveLocation from '../hooks/useLiveLocation';
import { apiService } from '../services/api';
import colors from '../theme/colors';

export default function GeofencesScreen({ navigation }) {
  const { location } = useLiveLocation(true);
  const [geofences, setGeofences] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      const [nextGeofences, nextMatches] = await Promise.all([
        apiService.getGeofences(),
        location ? apiService.checkGeofences(location) : Promise.resolve([])
      ]);

      if (!active) return;
      setGeofences(nextGeofences);
      setMatches(nextMatches);
    };

    loadData();
    return () => {
      active = false;
    };
  }, [location?.latitude, location?.longitude]);

  return (
    <ScreenShell>
      <TopBar
        title="Geofences"
        subtitle="Safe zones, caution areas, and support points"
        onMenuPress={() => navigation.openDrawer()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <InfoCard eyebrow="Current match" title="Zones around you">
        {matches.length ? matches.map((match) => (
          <View key={match.id} style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.name}>{match.name}</Text>
              <Text style={styles.meta}>{match.type} · {match.distance}m away</Text>
            </View>
            <View style={[styles.color, { backgroundColor: match.color || colors.primary }]} />
          </View>
        )) : <Text style={styles.muted}>No current matches found.</Text>}
      </InfoCard>

      <InfoCard eyebrow="Configured zones" title="Known tourist geofences">
        {geofences.map((zone) => (
          <View key={zone.id} style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.name}>{zone.name}</Text>
              <Text style={styles.meta}>Radius {zone.radius}m · {zone.type}</Text>
            </View>
            <View style={[styles.color, { backgroundColor: zone.color || colors.primary }]} />
          </View>
        ))}
      </InfoCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  copy: {
    flex: 1
  },
  name: {
    color: colors.text,
    fontWeight: '700'
  },
  meta: {
    color: colors.textMuted,
    marginTop: 4
  },
  color: {
    width: 16,
    height: 16,
    borderRadius: 8
  },
  muted: {
    color: colors.textMuted
  }
});
