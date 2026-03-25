import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InfoCard from '../components/InfoCard';
import { useAuth } from '../contexts/AuthContext';
import colors from '../theme/colors';

const avatarFromName = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f8a83&color=fff&size=256`;

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const displayName = user?.fullName || 'Traveler';
  const photoUri = user?.profilePhoto?.dataUrl || avatarFromName(displayName);

  return (
    <ScreenShell>
      <TopBar
        title="Profile"
        subtitle="Review and update your traveler information"
        onMenuPress={() => navigation.openDrawer()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <InfoCard>
        <View style={styles.headerRow}>
          <Image source={{ uri: photoUri }} style={styles.avatar} />
          <View style={styles.headerCopy}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.role}>Traveler</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
      </InfoCard>

      <InfoCard eyebrow="Profile data" title="Saved traveler information">
        <Detail label="First name" value={user?.firstName} />
        <Detail label="Last name" value={user?.lastName} />
        <Detail label="Phone" value={user?.phone} />
        <Detail label="Age" value={user?.age} />
        <Detail label="Destination" value={user?.destination} />
        <Detail label="Trip duration" value={user?.tripDurationDays ? `${user.tripDurationDays} days` : ''} />
        <Detail label="Blood group" value={user?.bloodGroup} />
        <Detail label="Health details" value={user?.medicalConditions} />
        <Detail label="Aadhaar status" value={user?.aadhaarVerified ? 'Verified' : 'Pending'} />
        <Detail label="Preferences" value={user?.travelPreferences?.join(', ')} />
      </InfoCard>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Edit Profile')}>
        <Text style={styles.primaryButtonText}>Edit existing data</Text>
      </Pressable>
    </ScreenShell>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Not provided'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center'
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 28
  },
  headerCopy: {
    flex: 1,
    gap: 4
  },
  name: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800'
  },
  role: {
    color: colors.primaryDark,
    fontWeight: '700'
  },
  email: {
    color: colors.textMuted
  },
  detail: {
    gap: 4
  },
  detailLabel: {
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '700'
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22
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
