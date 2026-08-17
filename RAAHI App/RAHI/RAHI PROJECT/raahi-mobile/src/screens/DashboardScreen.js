import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InfoCard from '../components/InfoCard';
import useLiveLocation from '../hooks/useLiveLocation';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import colors from '../theme/colors';

export default function DashboardScreen({ navigation }) {
  const { user, settings } = useAuth();
  const { location, status } = useLiveLocation(true);
  const [stats, setStats] = useState(null);
  const [tips, setTips] = useState([]);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const [nextStats, nextTips, nextDestinations] = await Promise.all([
        apiService.getUserStats(),
        apiService.getSafetyTips(),
        apiService.getDestinations()
      ]);

      if (!active) return;
      setStats(nextStats);
      setTips(nextTips.slice(0, 2));
      setDestinations(nextDestinations.slice(0, 3));
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const summaryTiles = [
    {
      label: 'Profile',
      value: `${stats?.profileCompleteness ?? 0}%`,
      caption: 'completion',
      icon: 'person-circle-outline'
    },
    {
      label: 'Activities',
      value: stats?.totalActivities ?? 0,
      caption: 'logged',
      icon: 'trail-sign-outline'
    },
    {
      label: 'Location',
      value: location ? 'Live' : 'Standby',
      caption: settings?.locationSharing ? 'sharing on' : 'private',
      icon: 'navigate-outline'
    }
  ];

  const quickActions = [
    { label: 'Open Live Map', route: 'Live Map', icon: 'map-outline' },
    { label: 'Emergency Help', route: 'Emergency', icon: 'warning-outline' },
    { label: 'AI Assistant', route: 'AI Assistant', icon: 'sparkles-outline' },
    { label: 'Nearby Places', route: 'Destinations', icon: 'compass-outline' }
  ];

  return (
    <ScreenShell>
      <TopBar
        title="Dashboard"
        subtitle="Your tourist safety overview"
        onMenuPress={() => navigation.openDrawer()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <LinearGradient colors={['#1f8a83', '#14615d']} style={styles.hero}>
        <Text style={styles.heroEyebrow}>Live traveler status</Text>
        <Text style={styles.heroTitle}>Welcome back, {user?.firstName || 'Traveler'}</Text>
        <Text style={styles.heroText}>{status}</Text>
        <View style={styles.heroRow}>
          <View style={styles.heroPill}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#ffffff" />
            <Text style={styles.heroPillText}>{user?.aadhaarVerified ? 'Verified profile' : 'Finish profile setup'}</Text>
          </View>
          <View style={styles.heroPill}>
            <Ionicons name="location-outline" size={16} color="#ffffff" />
            <Text style={styles.heroPillText}>{user?.destination || 'Trip not set'}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tileGrid}>
        {summaryTiles.map((item) => (
          <InfoCard key={item.label}>
            <Ionicons name={item.icon} size={22} color={colors.primaryDark} />
            <Text style={styles.tileLabel}>{item.label}</Text>
            <Text style={styles.tileValue}>{item.value}</Text>
            <Text style={styles.tileCaption}>{item.caption}</Text>
          </InfoCard>
        ))}
      </View>

      <InfoCard eyebrow="Quick access" title="Core safety tools">
        <View style={styles.quickGrid}>
          {quickActions.map((item) => (
            <Pressable key={item.route} style={styles.quickAction} onPress={() => navigation.navigate(item.route)}>
              <Ionicons name={item.icon} size={22} color={colors.primaryDark} />
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </InfoCard>

      <InfoCard eyebrow="Safety tips" title="What to keep in mind today">
        {tips.map((tip) => (
          <View key={tip.id} style={styles.listRow}>
            <View style={styles.dot} />
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{tip.title}</Text>
              <Text style={styles.listText}>{tip.description}</Text>
            </View>
          </View>
        ))}
      </InfoCard>

      <InfoCard eyebrow="Recommended places" title="Destinations near your plan">
        {destinations.map((destination) => (
          <Pressable
            key={destination.id}
            style={styles.destinationRow}
            onPress={() => navigation.navigate('Destinations')}
          >
            <View>
              <Text style={styles.destinationName}>{destination.name}</Text>
              <Text style={styles.destinationMeta}>
                {destination.category} · Rating {destination.rating} · Safety {destination.safetyRating}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </InfoCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    padding: 22,
    gap: 10
  },
  heroEyebrow: {
    color: '#ccebe7',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontWeight: '700',
    fontSize: 12
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff'
  },
  heroText: {
    color: '#e6f5f2',
    lineHeight: 22,
    fontSize: 15
  },
  heroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)'
  },
  heroPillText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  tileGrid: {
    gap: 12
  },
  tileLabel: {
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '700'
  },
  tileValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800'
  },
  tileCaption: {
    color: colors.textMuted
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  quickAction: {
    width: '47%',
    minHeight: 112,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fcf7f2',
    padding: 16,
    justifyContent: 'space-between'
  },
  quickLabel: {
    color: colors.text,
    fontWeight: '700',
    lineHeight: 20
  },
  listRow: {
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
  listCopy: {
    flex: 1,
    gap: 4
  },
  listTitle: {
    color: colors.text,
    fontWeight: '700'
  },
  listText: {
    color: colors.textMuted,
    lineHeight: 21
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#efe4d9'
  },
  destinationName: {
    color: colors.text,
    fontWeight: '700'
  },
  destinationMeta: {
    color: colors.textMuted,
    marginTop: 4
  }
});
