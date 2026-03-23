package com.example.rahi2.navigation

sealed class NavRoute(val route: String) {
    object Splash : NavRoute("splash")
    object Auth : NavRoute("auth")
    object Main : NavRoute("main") // This is a nested graph
    object Home : NavRoute("home")
    object Profile : NavRoute("profile")
    object Settings : NavRoute("settings")
    object IncidentReport : NavRoute("incident_report")
    object Map : NavRoute("map") // From Home to a standalone Map screen
    object SosDetails : NavRoute("sos_details") // New route for SOS details
    object GeofenceManagement : NavRoute("geofence_management") // New route for geofence management
}