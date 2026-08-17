import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenShell from '../components/ScreenShell';
import FormField from '../components/FormField';
import PreferenceSelector from '../components/PreferenceSelector';
import colors from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    travelPreferences: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Enter your name, email, and password to create an account.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const result = await register({
      ...form,
      userType: 'tourist'
    });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <ScreenShell>
      <LinearGradient colors={['#dcefe9', '#f7f1eb', '#f0e1d0']} style={styles.hero}>
        <Text style={styles.eyebrow}>RAAHI onboarding</Text>
        <Text style={styles.title}>Create your traveler account</Text>
        <Text style={styles.subtitle}>
          New tourists can register here and keep the same profile across mobile and web.
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <FormField label="First name" value={form.firstName} onChangeText={(value) => updateField('firstName', value)} placeholder="Aarav" />
        <FormField label="Last name" value={form.lastName} onChangeText={(value) => updateField('lastName', value)} placeholder="Sharma" />
        <FormField label="Email" value={form.email} onChangeText={(value) => updateField('email', value)} placeholder="you@example.com" keyboardType="email-address" />
        <FormField label="Password" value={form.password} onChangeText={(value) => updateField('password', value)} placeholder="Create a password" secureTextEntry />
        <FormField label="Phone" value={form.phone} onChangeText={(value) => updateField('phone', value)} placeholder="Optional mobile number" keyboardType="phone-pad" />

        <View style={styles.preferenceBlock}>
          <Text style={styles.preferenceLabel}>Travel interests</Text>
          <PreferenceSelector
            selected={form.travelPreferences}
            onChange={(value) => updateField('travelPreferences', value)}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable onPress={handleSubmit} style={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonLabel}>Create account</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 30,
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
  preferenceBlock: {
    gap: 10
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  errorText: {
    color: colors.danger,
    fontSize: 14
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
  linkButton: {
    alignItems: 'center'
  },
  linkText: {
    color: colors.primaryDark,
    fontWeight: '700'
  }
});
