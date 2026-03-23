package com.example.rahi2.api.models

// Base response wrapper
data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null,
    val error: String? = null,
    val details: List<ValidationError>? = null
)

data class ValidationError(
    val msg: String,
    val param: String,
    val location: String
)

// Authentication models
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String? = null,
    val address: String? = null
)

data class AuthResponse(
    val token: String,
    val user: User
)

data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)

// User model
data class User(
    val id: String,
    val name: String,
    val email: String,
    val phone: String? = null,
    val address: String? = null,
    val profilePicture: String? = null,
    val emergencyContacts: List<EmergencyContact> = emptyList(),
    val locationSettings: LocationSettings = LocationSettings(),
    val notificationSettings: NotificationSettings = NotificationSettings(),
    val lastLogin: String? = null,
    val createdAt: String,
    val updatedAt: String? = null
)

data class EmergencyContact(
    val name: String,
    val phone: String,
    val relationship: String? = null
)

data class LocationSettings(
    val shareLocation: Boolean = true,
    val emergencyLocationSharing: Boolean = true
)

data class NotificationSettings(
    val pushNotifications: Boolean = true,
    val emailNotifications: Boolean = false,
    val emergencyAlerts: Boolean = true
)

// Profile update models
data class ProfileUpdateRequest(
    val name: String? = null,
    val phone: String? = null,
    val address: String? = null
)

data class EmergencyContactsRequest(
    val emergencyContacts: List<EmergencyContact>
)

data class LocationSettingsRequest(
    val shareLocation: Boolean? = null,
    val emergencyLocationSharing: Boolean? = null
)

data class NotificationSettingsRequest(
    val pushNotifications: Boolean? = null,
    val emailNotifications: Boolean? = null,
    val emergencyAlerts: Boolean? = null
)

// Emergency models
data class EmergencyReportRequest(
    val type: String, // "emergency", "incident", "safety_concern"
    val description: String,
    val location: LocationData? = null
)

data class LocationData(
    val latitude: Double,
    val longitude: Double
)

data class EmergencyReportResponse(
    val reportId: String,
    val status: String,
    val timestamp: String
)

data class EmergencyStatusResponse(
    val reportId: String,
    val status: String,
    val lastUpdated: String,
    val notes: String? = null
)

// Statistics model
data class UserStats(
    val memberSince: String,
    val lastLogin: String? = null,
    val emergencyContactsCount: Int,
    val profileCompleteness: Int
)