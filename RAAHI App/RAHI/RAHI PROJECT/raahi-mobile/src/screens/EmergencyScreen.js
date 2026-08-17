import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InfoCard from '../components/InfoCard';
import useLiveLocation from '../hooks/useLiveLocation';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import colors from '../theme/colors';

export default function EmergencyScreen({ navigation }) {
  const { user } = useAuth();
  const { location } = useLiveLocation(true);
  const [contacts, setContacts] = useState([]);
  const [history, setHistory] = useState([]);
  const [guidance, setGuidance] = useState(null);
  const [isPanicLoading, setIsPanicLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      const [nextContacts, nextHistory, nextGuidance] = await Promise.all([
        apiService.getEmergencyContacts(user),
        apiService.getPanicHistory(),
        apiService.getEmergencyAssistance({
          location: user?.destination || 'Current trip',
          emergencyType: 'safety'
        })
      ]);

      if (!active) return;
      setContacts(nextContacts);
      setHistory(nextHistory.slice(0, 2));
      setGuidance(nextGuidance);
    };

    loadData();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const triggerPanic = async () => {
    if (!location) {
      setStatusText('Current location is required before sending a panic alert.');
      return;
    }

    setIsPanicLoading(true);
    setStatusText('');

    try {
      const response = await apiService.triggerPanic({
        email: user?.email,
        userId: user?.uid || user?.id,
        location,
        status: 'active'
      });

      setStatusText(response.message || 'Panic alert sent successfully.');
      const nextHistory = await apiService.getPanicHistory();
      setHistory(nextHistory.slice(0, 3));
    } catch (error) {
      setStatusText(apiService.toUserMessage(error, 'Unable to send panic alert.'));
    } finally {
      setIsPanicLoading(false);
    }
  };

  return (
    <ScreenShell>
      <TopBar
        title="Emergency"
        subtitle="Panic trigger, assistance steps, and contact shortcuts"
        onMenuPress={() => navigation.openDrawer()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <InfoCard eyebrow="Panic mode" title="One-tap emergency alert" tone="accent">
        <Pressable style={styles.panicButton} onPress={triggerPanic} disabled={isPanicLoading}>
          {isPanicLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.panicText}>Trigger Panic Alert</Text>}
        </Pressable>
        <Text style={styles.helper}>
          Sends your current location and account identifier to the backend emergency flow.
        </Text>
        {statusText ? <Text style={styles.status}>{statusText}</Text> : null}
      </InfoCard>

      <InfoCard eyebrow="Emergency directory" title="Essential contacts">
        {contacts.map((contact) => (
          <View key={contact.id || contact.phone} style={styles.row}>
            <View>
              <Text style={styles.name}>{contact.name}</Text>
              <Text style={styles.meta}>{contact.type} · {contact.phone}</Text>
            </View>
          </View>
        ))}
      </InfoCard>

      <InfoCard eyebrow="Immediate guidance" title="What RAAHI recommends">
        {guidance?.immediateActions?.map((item) => (
          <View key={item} style={styles.actionRow}>
            <View style={styles.dot} />
            <Text style={styles.actionText}>{item}</Text>
          </View>
        ))}
      </InfoCard>

      <InfoCard eyebrow="Alert history" title="Recent emergency activity">
        {history.map((item) => (
          <View key={item.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{item.status}</Text>
              <Text style={styles.meta}>{item.timestampFormatted || item.timestamp}</Text>
            </View>
          </View>
        ))}
      </InfoCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  panicButton: {
    minHeight: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger
  },
  panicText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800'
  },
  helper: {
    color: colors.textMuted,
    lineHeight: 21
  },
  status: {
    color: colors.text,
    fontWeight: '700'
  },
  row: {
    paddingVertical: 4
  },
  name: {
    color: colors.text,
    fontWeight: '700',
    textTransform: 'capitalize'
  },
  meta: {
    color: colors.textMuted,
    marginTop: 4
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    marginTop: 6
  },
  actionText: {
    flex: 1,
    color: colors.text,
    lineHeight: 22
  }
});
