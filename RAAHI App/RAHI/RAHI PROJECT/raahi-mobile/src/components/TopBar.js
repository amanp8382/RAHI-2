import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function TopBar({ title, subtitle, onMenuPress, onProfilePress }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onMenuPress} style={styles.iconButton}>
        <Ionicons name="menu" size={22} color={colors.text} />
      </Pressable>

      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <Pressable onPress={onProfilePress} style={styles.iconButton}>
        <Ionicons name="person-circle-outline" size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border
  },
  copy: {
    flex: 1
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted
  }
});
