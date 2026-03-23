package com.example.rahi2.ui.strings

import androidx.compose.runtime.compositionLocalOf

enum class Language { EN, HI }

data class AppStrings(
	val appTitle: String,
	val homeSOS: String,
	val homeMap: String,
	val homeReportIncident: String,
	val profileTitle: String,
	val edit: String,
	val editProfile: String,
	val save: String,
	val cancel: String,
	val logout: String,
	val name: String,
	val email: String,
	val address: String,
	val phone: String,
	val incidentTitle: String,
	val incidentDesc: String,
	val incidentLocation: String,
	val incidentSubmit: String,
	val incidentSubmitted: String,
	val authWelcome: String,
	val authLogin: String,
	val authSignup: String,
	val homeTabLabel: String,
	val profileTabLabel: String,

	// SOS Feature Strings
	val sosDialogTitle: String,
	val sosDialogMessage: String,
	val sosDialogConfirm: String,
	val sosDialogCancel: String,
	val sosSmsMessagePrefix: String,
	val sosSmsMessageNoLocation: String,
	val sosSmsSent: String,
	val sosSmsFailed: String,
	val sosSmsPermissionDenied: String,
	val sosLocationPermissionDeniedForSms: String,
	val sosFetchingLocation: String,
	val sosLocationSuccess: String,
	val sosLocationFailed: String,
	val sosCallingEmergencyServices: String
)

val EnglishStrings = AppStrings(
	appTitle = "Smart Tourist Safety",
	homeSOS = "SOS",
	homeMap = "Map",
	homeReportIncident = "Report Incident",
	profileTitle = "Profile",
	edit = "Edit",
	editProfile = "Edit Profile",
	save = "Save",
	cancel = "Cancel",
	logout = "Logout",
	name = "Name",
	email = "Email",
	address = "Address",
	phone = "Phone Number",
	incidentTitle = "Report Incident",
	incidentDesc = "Description",
	incidentLocation = "Location",
	incidentSubmit = "Submit",
	incidentSubmitted = "Incident submitted!",
	authWelcome = "Welcome",
	authLogin = "Login",
	authSignup = "Sign Up",
	homeTabLabel = "Home",
	profileTabLabel = "Profile",

	// SOS Feature Strings - English
	sosDialogTitle = "Emergency SOS",
	sosDialogMessage = "This will attempt to send your location to an emergency contact and then call emergency services (112). Are you sure?",
	sosDialogConfirm = "Proceed with SOS",
	sosDialogCancel = "Cancel",
	sosSmsMessagePrefix = "SOS! I need help. My current location is:",
	sosSmsMessageNoLocation = "SOS! I need help. Unable to get current location.",
	sosSmsSent = "SMS sent to emergency contact.",
	sosSmsFailed = "Failed to send SMS",
	sosSmsPermissionDenied = "SMS permission denied. Cannot send SMS.",
	sosLocationPermissionDeniedForSms = "Location permission denied. Proceeding without location for SMS.",
	sosFetchingLocation = "Fetching location for SOS…",
	sosLocationSuccess = "Location fetched.",
	sosLocationFailed = "Could not get location",
	sosCallingEmergencyServices = "Calling emergency services…"
)

val HindiStrings = AppStrings(
	appTitle = "स्मार्ट टूरिस्ट सेफ़्टी",
	homeSOS = "आपातकाल (SOS)",
	homeMap = "मानचित्र",
	homeReportIncident = "घटना रिपोर्ट",
	profileTitle = "प्रोफ़ाइल",
	edit = "संपादित करें",
	editProfile = "प्रोफ़ाइल संपादित करें",
	save = "सहेजें",
	cancel = "रद्द करें",
	logout = "लॉग आउट",
	name = "नाम",
	email = "ईमेल",
	address = "पता",
	phone = "फ़ोन नंबर",
	incidentTitle = "घटना रिपोर्ट",
	incidentDesc = "विवरण",
	incidentLocation = "स्थान",
	incidentSubmit = "जमा करें",
	incidentSubmitted = "घटना सबमिट की गई!",
	authWelcome = "स्वागत है",
	authLogin = "लॉगिन",
	authSignup = "साइन अप",
	homeTabLabel = "होम",
	profileTabLabel = "प्रोफ़ाइल",

	// SOS Feature Strings - Hindi (using English as placeholders - PLEASE TRANSLATE)
	sosDialogTitle = "Emergency SOS", // Needs Hindi translation
	sosDialogMessage = "This will attempt to send your location to an emergency contact and then call emergency services (112). Are you sure?", // Needs Hindi translation
	sosDialogConfirm = "Proceed with SOS", // Needs Hindi translation
	sosDialogCancel = "Cancel", // Needs Hindi translation
	sosSmsMessagePrefix = "SOS! I need help. My current location is:", // Needs Hindi translation
	sosSmsMessageNoLocation = "SOS! I need help. Unable to get current location.", // Needs Hindi translation
	sosSmsSent = "SMS sent to emergency contact.", // Needs Hindi translation
	sosSmsFailed = "Failed to send SMS", // Needs Hindi translation
	sosSmsPermissionDenied = "SMS permission denied. Cannot send SMS.", // Needs Hindi translation
	sosLocationPermissionDeniedForSms = "Location permission denied. Proceeding without location for SMS.", // Needs Hindi translation
	sosFetchingLocation = "Fetching location for SOS…", // Needs Hindi translation
	sosLocationSuccess = "Location fetched.", // Needs Hindi translation
	sosLocationFailed = "Could not get location", // Needs Hindi translation
	sosCallingEmergencyServices = "Calling emergency services…" // Needs Hindi translation
)

val LocalStrings = compositionLocalOf { EnglishStrings }


