import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InfoCard from '../components/InfoCard';
import colors from '../theme/colors';
import { apiService } from '../services/api';

export default function DestinationsScreen({ navigation }) {
  const [destinations, setDestinations] = useState([]);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    let active = true;
    apiService.getDestinations().then((items) => {
      if (active) setDestinations(items);
    });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => ['All', ...new Set(destinations.map((item) => item.category))], [destinations]);

  const filtered = destinations.filter((item) => {
    const matchesQuery = !query.trim() || `${item.name} ${item.location}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <ScreenShell>
      <TopBar
        title="Destinations"
        subtitle="Browse places with safety-aware travel context"
        onMenuPress={() => navigation.openDrawer()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <InfoCard eyebrow="Search" title="Find your next stop">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search destinations"
          placeholderTextColor={colors.textMuted}
          style={styles.search}
        />
        <View style={styles.chips}>
          {categories.map((category) => {
            const active = category === activeCategory;
            return (
              <Pressable
                key={category}
                style={[styles.chip, active && styles.activeChip]}
                onPress={() => setActiveCategory(category)}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>{category}</Text>
              </Pressable>
            );
          })}
        </View>
      </InfoCard>

      {filtered.map((destination) => (
        <InfoCard key={destination.id} eyebrow={destination.category} title={destination.name}>
          <Text style={styles.meta}>{destination.location}</Text>
          <Text style={styles.description}>{destination.description}</Text>
          <View style={styles.statsRow}>
            <Badge label={`Rating ${destination.rating}`} />
            <Badge label={`Safety ${destination.safetyRating}`} tone="safe" />
          </View>
        </InfoCard>
      ))}
    </ScreenShell>
  );
}

function Badge({ label, tone = 'default' }) {
  return (
    <View style={[styles.badge, tone === 'safe' && styles.safeBadge]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipText: {
    color: colors.text,
    fontWeight: '700'
  },
  activeChipText: {
    color: '#ffffff'
  },
  meta: {
    color: colors.textMuted
  },
  description: {
    color: colors.text,
    lineHeight: 22
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#efe4d9'
  },
  safeBadge: {
    backgroundColor: colors.safe
  },
  badgeText: {
    color: colors.text,
    fontWeight: '700'
  }
});
