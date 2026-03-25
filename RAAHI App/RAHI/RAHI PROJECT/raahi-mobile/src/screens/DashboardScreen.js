import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InfoCard from '../components/InfoCard';
import SafetyZoneMap from '../components/SafetyZoneMap';
import useLiveLocation from '../hooks/useLiveLocation';
import { useAuth } from '../contexts/AuthContext';
import colors from '../theme/colors';
import { API_BASE_URL } from '../services/api';

const avatarFromName = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f8a83&color=fff&size=256`;

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { location, status } = useLiveLocation(true);

  const displayName = user?.fullName || 'Traveler';
  const photoUri = user?.profilePhoto?.dataUrl || avatarFromName(displayName);
  const publicCardUrl = user?.publicCardPath ? `${API_BASE_URL.replace(/\/api$/, '')}${user.publicCardPath}` : '';
  const aadhaarDisplay = user?.aadhaarNumber ? `XXXX-XXXX-${String(user.aadhaarNumber).slice(-4)}` : 'Not provided';

  return (
    <ScreenShell>
      <TopBar
        title="Tourist Dashboard"
        subtitle="Your RAAHI profile and trip details"
        onMenuPress={() => navigation.openDrawer()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <LinearGradient colors={['#9f7a5d', '#8b6b52']} style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>RAAHI verify</Text>
          <Text style={styles.heroTitle}>Verified Traveler</Text>
          <Text style={styles.heroText}>{status}</Text>
        </View>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeLabel}>Traveler ID</Text>
          <Text style={styles.heroBadgeValue}>{user?.travelerId || 'Pending'}</Text>
        </View>
      </LinearGradient>

      <InfoCard>
        <View style={styles.profileRow}>
          <Image source={{ uri: photoUri }} style={styles.avatar} />
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={[styles.statusPill, user?.aadhaarVerified ? styles.verified : styles.pending]}>
              <Text style={styles.statusPillText}>
                {user?.aadhaarVerified ? 'Verified traveler' : 'Profile needs attention'}
              </Text>
            </View>
          </View>
        </View>
      </InfoCard>

      <InfoCard eyebrow="Trip profile" title="Traveler details">
        <View style={styles.detailGrid}>
          <Detail label="Phone" value={user?.phone} />
          <Detail label="Age" value={user?.age} />
          <Detail label="Destination" value={user?.destination} />
          <Detail label="Trip duration" value={user?.tripDurationDays ? `${user.tripDurationDays} days` : ''} />
          <Detail label="Blood group" value={user?.bloodGroup} />
          <Detail label="Health details" value={user?.medicalConditions} />
          <Detail label="Aadhaar" value={aadhaarDisplay} />
          <Detail
            label="Live coordinates"
            value={location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Waiting for GPS'}
          />
        </View>
      </InfoCard>

      <InfoCard eyebrow="Location" title="Live location and safety zones">
        <SafetyZoneMap location={location} />
      </InfoCard>

      <InfoCard eyebrow="Verification" title="Traveler QR">
        <View style={styles.qrCard}>
          {publicCardUrl ? <QRCode value={publicCardUrl} size={140} /> : <Text style={styles.muted}>Public traveler card will appear after sync.</Text>}
          <Text style={styles.qrHint}>Share this QR so officials can verify your traveler card.</Text>
        </View>
      </InfoCard>

      <View style={styles.actionRow}>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Safety Score')}>
          <Text style={styles.secondaryButtonText}>Safety Score</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.secondaryButtonText}>Edit Profile</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={logout}>
          <Text style={styles.primaryButtonText}>Logout</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Not provided'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    padding: 22,
    gap: 20
  },
  heroCopy: {
    gap: 8
  },
  heroEyebrow: {
    color: '#eadfd4',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '700',
    fontSize: 12
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff'
  },
  heroText: {
    color: '#f3ebe3',
    lineHeight: 22,
    fontSize: 15
  },
  heroBadge: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  heroBadgeLabel: {
    color: '#eadfd4',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4
  },
  heroBadgeValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8
  },
  profileRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center'
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24
  },
  profileCopy: {
    flex: 1,
    gap: 6
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text
  },
  email: {
    color: colors.textMuted,
    fontSize: 15
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999
  },
  verified: {
    backgroundColor: colors.safe
  },
  pending: {
    backgroundColor: '#f7ead7'
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  detailGrid: {
    gap: 14
  },
  detailItem: {
    gap: 4
  },
  detailLabel: {
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    fontSize: 11
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22
  },
  qrCard: {
    alignItems: 'center',
    gap: 14
  },
  qrHint: {
    textAlign: 'center',
    color: colors.textMuted,
    lineHeight: 20
  },
  muted: {
    color: colors.textMuted
  },
  actionRow: {
    gap: 12,
    marginBottom: 20
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700'
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700'
  }
});
