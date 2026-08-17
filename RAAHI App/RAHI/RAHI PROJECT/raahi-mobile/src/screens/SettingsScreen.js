import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InfoCard from '../components/InfoCard';
import { useAuth } from '../contexts/AuthContext';
import colors from '../theme/colors';

export default function SettingsScreen({ navigation }) {
  const { settings, updateAppSettings } = useAuth();

  const toggleSetting = (key) => {
    updateAppSettings({
      ...(settings || {}),
      [key]: !settings?.[key]
    });
  };

  const toggleRows = [
    ['locationSharing', 'Location privacy'],
    ['panicAutoShare', 'Auto-share location on panic'],
    ['geofenceAlerts', 'Geofence entry and exit alerts'],
    ['weatherAlerts', 'Weather warnings'],
    ['chatbotNotifications', 'Assistant follow-up notifications'],
    ['offlineCaching', 'Offline cache for destinations']
  ];

  return (
    <ScreenShell>
      <TopBar
        title="Settings"
        subtitle="Privacy, notifications, and offline controls"
        onMenuPress={() => navigation.openDrawer()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <InfoCard eyebrow="Privacy and alerts" title="Traveler controls">
        {toggleRows.map(([key, label]) => (
          <Pressable key={key} style={styles.row} onPress={() => toggleSetting(key)}>
            <View style={styles.copy}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.meta}>{settings?.[key] ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <View style={[styles.toggle, settings?.[key] && styles.toggleActive]}>
              <View style={[styles.knob, settings?.[key] && styles.knobActive]} />
            </View>
          </Pressable>
        ))}
      </InfoCard>

      <InfoCard eyebrow="Data handling" title="What this build supports">
        <Text style={styles.description}>
          This Expo setup persists chat history, location snapshots, and app settings locally. Background geolocation, secure hardware-backed token storage, and push notifications still need the additional native packages listed in your full project spec.
        </Text>
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
  label: {
    color: colors.text,
    fontWeight: '700'
  },
  meta: {
    color: colors.textMuted,
    marginTop: 4
  },
  toggle: {
    width: 54,
    height: 30,
    borderRadius: 999,
    backgroundColor: '#d8cdc2',
    padding: 4
  },
  toggleActive: {
    backgroundColor: colors.primary
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff'
  },
  knobActive: {
    marginLeft: 'auto'
  },
  description: {
    color: colors.text,
    lineHeight: 22
  }
});
