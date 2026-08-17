import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LiveMapScreen from '../screens/LiveMapScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import DestinationsScreen from '../screens/DestinationsScreen';
import AssistantScreen from '../screens/AssistantScreen';
import GeofencesScreen from '../screens/GeofencesScreen';
import SafetyScoreScreen from '../screens/SafetyScoreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useAuth } from '../contexts/AuthContext';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const drawerItems = [
  { label: 'Dashboard', icon: 'grid-outline', route: 'Dashboard' },
  { label: 'Live Map', icon: 'location-outline', route: 'Live Map' },
  { label: 'Emergency', icon: 'warning-outline', route: 'Emergency' },
  { label: 'Destinations', icon: 'compass-outline', route: 'Destinations' },
  { label: 'AI Assistant', icon: 'chatbubble-ellipses-outline', route: 'AI Assistant' },
  { label: 'Geofences', icon: 'radio-outline', route: 'Geofences' },
  { label: 'Safety Score', icon: 'shield-checkmark-outline', route: 'Safety Score' },
  { label: 'Profile', icon: 'person-outline', route: 'Profile' },
  { label: 'Settings', icon: 'settings-outline', route: 'Settings' }
];

function CustomDrawerContent(props) {
  const { user, logout } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerEyebrow}>RAAHI Tourist App</Text>
        <Text style={styles.drawerTitle}>{user?.fullName || 'Traveler'}</Text>
        <Text style={styles.drawerSubtitle}>{user?.email || ''}</Text>
      </View>

      {drawerItems.map((item) => (
        <DrawerItem
          key={item.route}
          label={item.label}
          labelStyle={styles.drawerLabel}
          icon={({ color, size }) => <Ionicons name={item.icon} size={size} color={color} />}
          onPress={() => props.navigation.navigate(item.route)}
        />
      ))}

      <DrawerItem
        label="Logout"
        labelStyle={styles.drawerLabel}
        icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
        onPress={logout}
      />
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  const { hasCompletedProfile } = useAuth();

  return (
    <Drawer.Navigator
      initialRouteName={hasCompletedProfile ? 'Dashboard' : 'Edit Profile'}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          width: 300,
          backgroundColor: '#fffaf6'
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Live Map" component={LiveMapScreen} />
      <Drawer.Screen name="Emergency" component={EmergencyScreen} />
      <Drawer.Screen name="Destinations" component={DestinationsScreen} />
      <Drawer.Screen name="AI Assistant" component={AssistantScreen} />
      <Drawer.Screen name="Geofences" component={GeofencesScreen} />
      <Drawer.Screen name="Safety Score" component={SafetyScoreScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Edit Profile" component={EditProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading RAAHI...</Text>
    </View>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.surfaceStrong,
          text: colors.text,
          border: colors.border,
          primary: colors.primary
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 14
  },
  loadingText: {
    fontSize: 15,
    color: colors.textMuted
  },
  drawerContent: {
    flex: 1,
    paddingTop: 10
  },
  drawerHeader: {
    margin: 16,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#efe4d9',
    gap: 6
  },
  drawerEyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSoft
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text
  },
  drawerSubtitle: {
    color: colors.textMuted
  },
  drawerLabel: {
    fontSize: 15,
    fontWeight: '600'
  }
});
