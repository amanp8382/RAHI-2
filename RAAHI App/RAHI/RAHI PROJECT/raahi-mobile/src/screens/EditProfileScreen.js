import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InfoCard from '../components/InfoCard';
import FormField from '../components/FormField';
import PreferenceSelector from '../components/PreferenceSelector';
import { useAuth } from '../contexts/AuthContext';
import colors from '../theme/colors';

const aadhaarRegex = /^\d{12}$/;

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    age: user?.age ? String(user.age) : '',
    destination: user?.destination || '',
    tripDurationDays: user?.tripDurationDays ? String(user.tripDurationDays) : '',
    bloodGroup: user?.bloodGroup || '',
    medicalConditions: user?.medicalConditions || '',
    aadhaarNumber: user?.aadhaarNumber || '',
    travelPreferences: user?.travelPreferences || [],
    profilePhoto: user?.profilePhoto || null
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    updateField('profilePhoto', {
      dataUrl: asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri,
      fileName: asset.fileName || 'profile-photo.jpg'
    });
  };

  const validate = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return 'Enter your first and last name.';
    if (!form.phone.trim()) return 'Enter your phone number.';
    if (!form.age.trim() || Number(form.age) <= 0) return 'Enter a valid age.';
    if (!form.destination.trim()) return 'Enter where you are travelling.';
    if (!form.tripDurationDays.trim() || Number(form.tripDurationDays) <= 0) return 'Enter trip duration in days.';
    if (!form.bloodGroup.trim()) return 'Enter your blood group.';
    if (!aadhaarRegex.test(form.aadhaarNumber.trim())) return 'Aadhaar number must be 12 digits.';
    return '';
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      ...form,
      age: Number(form.age),
      tripDurationDays: Number(form.tripDurationDays),
      aadhaarVerified: true
    };

    const result = await updateProfile(payload);
    setIsSaving(false);

    if (!result.success) {
      setError(result.error || 'Unable to save profile.');
      return;
    }

    setSuccess(result.message || 'Profile updated successfully.');
    navigation.navigate('Profile');
  };

  return (
    <ScreenShell>
      <TopBar
        title="Edit Profile"
        subtitle="Update the traveler information shown across the app"
        onMenuPress={() => navigation.openDrawer()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <InfoCard eyebrow="Traveler details" title="Update your information">
        <FormField label="First name" value={form.firstName} onChangeText={(value) => updateField('firstName', value)} placeholder="First name" />
        <FormField label="Last name" value={form.lastName} onChangeText={(value) => updateField('lastName', value)} placeholder="Last name" />
        <FormField label="Phone" value={form.phone} onChangeText={(value) => updateField('phone', value)} placeholder="Phone" keyboardType="phone-pad" />
        <FormField label="Age" value={form.age} onChangeText={(value) => updateField('age', value)} placeholder="Age" keyboardType="numeric" />
        <FormField label="Where travelling" value={form.destination} onChangeText={(value) => updateField('destination', value)} placeholder="Destination" />
        <FormField
          label="For how many days"
          value={form.tripDurationDays}
          onChangeText={(value) => updateField('tripDurationDays', value)}
          placeholder="Trip duration"
          keyboardType="numeric"
        />
        <FormField label="Blood group" value={form.bloodGroup} onChangeText={(value) => updateField('bloodGroup', value)} placeholder="Blood group" />
        <FormField
          label="Health related data"
          value={form.medicalConditions}
          onChangeText={(value) => updateField('medicalConditions', value)}
          placeholder="Disease, allergies, medication notes"
          multiline
        />
        <FormField
          label="Aadhaar number"
          value={form.aadhaarNumber}
          onChangeText={(value) => updateField('aadhaarNumber', value.replace(/\D/g, '').slice(0, 12))}
          placeholder="12 digit Aadhaar number"
          keyboardType="numeric"
        />

        <View style={styles.preferenceBlock}>
          <Text style={styles.preferenceLabel}>Travel preferences</Text>
          <PreferenceSelector
            selected={form.travelPreferences}
            onChange={(value) => updateField('travelPreferences', value)}
          />
        </View>

        <Pressable style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.photoButtonText}>{form.profilePhoto ? 'Change profile photo' : 'Upload profile photo'}</Text>
        </Pressable>
        {form.profilePhoto?.dataUrl ? <Image source={{ uri: form.profilePhoto.dataUrl }} style={styles.photoPreview} /> : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Save profile</Text>}
        </Pressable>
      </InfoCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  preferenceBlock: {
    gap: 10
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  photoButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#efe4d9'
  },
  photoButtonText: {
    color: colors.text,
    fontWeight: '700'
  },
  photoPreview: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignSelf: 'center'
  },
  error: {
    color: colors.danger
  },
  success: {
    color: colors.success
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
