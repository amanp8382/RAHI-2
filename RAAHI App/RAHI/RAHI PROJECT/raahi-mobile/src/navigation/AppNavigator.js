import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SafetyScoreScreen from '../screens/SafetyScoreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { useAuth } from '../contexts/AuthContext';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { user, logout } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerEyebrow}>RAAHI Mobile</Text>
        <Text style={styles.drawerTitle}>{user?.fullName || 'Traveler'}</Text>
        <Text style={styles.drawerSubtitle}>{user?.email || ''}</Text>
      </View>

      <DrawerItem
        label="Tourist Dashboard"
        labelStyle={styles.drawerLabel}
        icon={({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />}
        onPress={() => props.navigation.navigate('Tourist Dashboard')}
      />
      <DrawerItem
        label="Safety Score"
        labelStyle={styles.drawerLabel}
        icon={({ color, size }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} />}
        onPress={() => props.navigation.navigate('Safety Score')}
      />
      <DrawerItem
        label="Profile"
        labelStyle={styles.drawerLabel}
        icon={({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />}
        onPress={() => props.navigation.navigate('Profile')}
      />
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
      initialRouteName={hasCompletedProfile ? 'Tourist Dashboard' : 'Edit Profile'}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          width: 290,
          backgroundColor: '#fffaf6'
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Tourist Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Safety Score" component={SafetyScoreScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Edit Profile" component={EditProfileScreen} />
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
          <Stack.Screen name="Login" component={LoginScreen} />
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
