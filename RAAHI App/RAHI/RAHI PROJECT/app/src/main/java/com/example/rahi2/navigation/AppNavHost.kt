package com.example.rahi2.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import com.example.rahi2.ui.screens.AuthScreen
import com.example.rahi2.ui.screens.GeofenceManagementScreen
import com.example.rahi2.ui.screens.IncidentReportScreen
import com.example.rahi2.ui.screens.MainShellScreen
import com.example.rahi2.ui.screens.SettingsScreen
import com.example.rahi2.ui.screens.SplashScreen
import com.example.rahi2.ui.screens.sos.SosDetailsScreen // Import for SosDetailsScreen
import com.example.rahi2.ui.screens.tabs.HomeTab
import com.example.rahi2.ui.screens.tabs.MapTab
import com.example.rahi2.ui.screens.tabs.ProfileTab
import com.example.rahi2.ui.strings.Language

@Composable
fun AppNavHost(
    navController: NavHostController,
    modifier: Modifier = Modifier,
    currentLanguage: Language, 
    onChangeLanguage: (Language) -> Unit
) {
    NavHost(
        navController = navController,
        startDestination = NavRoute.Splash.route,
        modifier = modifier
    ) {
        // Splash
        composable(NavRoute.Splash.route) {
            SplashScreen(onFinished = {
                navController.navigate(NavRoute.Auth.route) {
                    popUpTo(NavRoute.Splash.route) { inclusive = true }
                }
            })
        }

        // Auth
        composable(NavRoute.Auth.route) {
            AuthScreen(
                onLogin = {
                    navController.navigate(NavRoute.Main.route) {
                        popUpTo(NavRoute.Auth.route) { inclusive = true }
                    }
                },
                onSignUp = {
                    navController.navigate(NavRoute.Main.route) {
                        popUpTo(NavRoute.Auth.route) { inclusive = true }
                    }
                }
            )
        }

        // Main shell with bottom tabs (Home, Profile, Settings)
        navigation(startDestination = NavRoute.Home.route, route = NavRoute.Main.route) {
            composable(NavRoute.Home.route) {
                MainShellScreen(
                    selectedRoute = NavRoute.Home.route,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            launchSingleTop = true
                            restoreState = true
                            popUpTo(NavRoute.Home.route) { saveState = true }
                        }
                    },
                    onSosClick = { navController.navigate(NavRoute.SosDetails.route) },
                    content = { HomeTab(
                        onReportIncident = { navController.navigate(NavRoute.IncidentReport.route) },
                        onOpenMap = { navController.navigate(NavRoute.Map.route) },
                        onNavigateToSosDetails = { navController.navigate(NavRoute.SosDetails.route) },
                        onNavigateToGeofenceManagement = { navController.navigate(NavRoute.GeofenceManagement.route) }
                    ) }
                )
            }
            composable(NavRoute.Profile.route) {
                MainShellScreen(
                    selectedRoute = NavRoute.Profile.route,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            launchSingleTop = true
                            restoreState = true
                            popUpTo(NavRoute.Home.route) { saveState = true }
                        }
                    },
                    onSosClick = { navController.navigate(NavRoute.SosDetails.route) },
                    content = {
                        ProfileTab(onLogout = {
                            navController.navigate(NavRoute.Auth.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        })
                    }
                )
            }
            composable(NavRoute.Settings.route) {
                MainShellScreen(
                    selectedRoute = NavRoute.Settings.route,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            launchSingleTop = true
                            restoreState = true
                            popUpTo(NavRoute.Home.route) { saveState = true }
                        }
                    },
                    onSosClick = { navController.navigate(NavRoute.SosDetails.route) },
                    content = {
                        SettingsScreen(
                            selectedLanguage = currentLanguage,
                            onChangeLanguage = onChangeLanguage
                        )
                    }
                )
            }
        }

        // Incident report
        composable(NavRoute.IncidentReport.route) {
            IncidentReportScreen(onBack = { navController.popBackStack() })
        }

        // Map as a standalone screen (from Home)
        composable(NavRoute.Map.route) {
            MapTab(
                onNavigateToGeofenceManagement = {
                    navController.navigate(NavRoute.GeofenceManagement.route)
                }
            )
        }
        
        // SOS Details Screen
        composable(NavRoute.SosDetails.route) {
            SosDetailsScreen(navController = navController)
        }

        // Geofence Management Screen
        composable(NavRoute.GeofenceManagement.route) {
            GeofenceManagementScreen(onBack = { navController.popBackStack() })
        }
    }
}
