import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenShell from '../components/ScreenShell';
import FormField from '../components/FormField';
import colors from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password.');
      return;
    }

    setError('');
    const result = await login({ email: email.trim(), password, userType: 'tourist' });
    if (!result.success) {
      setError(result.error || 'Login failed.');
    }
  };

  return (
    <ScreenShell contentContainerStyle={styles.container}>
      <LinearGradient colors={['#f0e1d0', '#f7f1eb', '#dcefe9']} style={styles.hero}>
        <Text style={styles.eyebrow}>RAAHI Mobile</Text>
        <Text style={styles.title}>Traveler login</Text>
        <Text style={styles.subtitle}>
          Use the same tourist account you created on RAAHI Web. This mobile app keeps the same traveler profile, live location, and safety score flow.
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your registered email"
          keyboardType="email-address"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable onPress={handleSubmit} style={styles.primaryButton} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonLabel}>Login</Text>}
        </Pressable>

        <Text style={styles.helperText}>
          Backend URL is controlled by `EXPO_PUBLIC_API_BASE_URL` or `app.json`.
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flexGrow: 1
  },
  hero: {
    borderRadius: 28,
    padding: 24,
    gap: 10
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted
  },
  card: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  primaryButtonLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  errorText: {
    color: colors.danger,
    fontSize: 14
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  }
});
