import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import colors from '../theme/colors';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default function SafetyZoneMap({ location }) {
  const x = location?.longitude ? clamp(((location.longitude + 180) / 360) * 280, 24, 256) : 140;
  const y = location?.latitude ? clamp(((90 - location.latitude) / 180) * 180, 24, 156) : 90;

  return (
    <View style={styles.wrapper}>
      <Svg width="100%" height="200" viewBox="0 0 280 180">
        <Rect x="18" y="18" width="100" height="58" rx="18" fill="#d7f0de" />
        <Rect x="162" y="26" width="92" height="62" rx="18" fill="#f9d9d6" />
        <Rect x="90" y="104" width="110" height="54" rx="18" fill="#d7f0de" />
        <Circle cx={x} cy={y} r="10" fill={colors.primaryDark} />
        <Circle cx={x} cy={y} r="18" fill="rgba(20,97,93,0.18)" />
      </Svg>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: '#d7f0de' }]} />
          <Text style={styles.legendLabel}>Green zone</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: '#f9d9d6' }]} />
          <Text style={styles.legendLabel}>Red zone</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: colors.primaryDark }]} />
          <Text style={styles.legendLabel}>You</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7
  },
  legendLabel: {
    color: colors.textMuted,
    fontSize: 13
  }
});
