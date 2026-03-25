import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import colors from '../theme/colors';

export default function ScreenShell({ children, scroll = true, contentContainerStyle }) {
  const Wrapper = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Wrapper style={styles.wrapper} contentContainerStyle={[styles.content, contentContainerStyle]}>
        {children}
      </Wrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  wrapper: {
    flex: 1
  },
  content: {
    padding: 20,
    gap: 18
  }
});
