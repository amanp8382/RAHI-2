package com.example.rahi2.data

import java.util.Date

data class User(
    val id: String = "",
    val email: String = "",
    val name: String = "",
    val phone: String = "",
    val address: String = "",
    val profilePicture: String? = null,
    val emergencyContacts: List<EmergencyContact> = emptyList(),
    val locationSettings: LocationSettings = LocationSettings(),
    val notificationSettings: NotificationSettings = NotificationSettings(),
    val isActive: Boolean = true,
    val lastLogin: String? = null,
    val createdAt: String = "",
    val updatedAt: String? = null
)

data class EmergencyContact(
    val name: String = "",
    val phone: String = "",
    val relationship: String = ""
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

// For API responses
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

// For login/registration requests
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String = "",
    val address: String = ""
)

data class AuthResponse(
    val token: String,
    val user: User
)