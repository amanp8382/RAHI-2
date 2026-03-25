import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function InfoCard({ eyebrow, title, children, tone = 'default' }) {
  return (
    <View style={[styles.card, tone === 'accent' && styles.accent]}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    gap: 14
  },
  accent: {
    backgroundColor: '#f2ebe3'
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textSoft,
    fontWeight: '700'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  }
});
