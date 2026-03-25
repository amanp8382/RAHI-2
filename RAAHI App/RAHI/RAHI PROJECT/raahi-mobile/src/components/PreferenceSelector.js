import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

export const PREFERENCES = ['Adventure', 'Culture', 'Beaches', 'Mountains', 'History', 'Food', 'Nature'];

export default function PreferenceSelector({ selected = [], onChange }) {
  const toggle = (item) => {
    if (selected.includes(item)) {
      onChange(selected.filter((entry) => entry !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <View style={styles.grid}>
      {PREFERENCES.map((item) => {
        const active = selected.includes(item);
        return (
          <Pressable key={item} onPress={() => toggle(item)} style={[styles.chip, active && styles.activeChip]}>
            <Text style={[styles.label, active && styles.activeLabel]}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  label: {
    color: colors.text,
    fontWeight: '600'
  },
  activeLabel: {
    color: '#ffffff'
  }
});
