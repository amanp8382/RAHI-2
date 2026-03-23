package com.example.rahi2.repository

import android.content.Context
import android.content.SharedPreferences
import com.example.rahi2.data.User
import com.example.rahi2.data.EmergencyContact
import com.example.rahi2.data.LocationSettings
import com.example.rahi2.data.NotificationSettings
import com.example.rahi2.api.NetworkClient
import com.example.rahi2.api.models.ProfileUpdateRequest
import kotlinx.coroutines.delay

class ProfileRepository(private val context: Context) {

    private val networkClient = NetworkClient.getInstance(context)
    private val profileService = networkClient.profileService
    private val authRepository = AuthRepository(context)

    private val sharedPrefs: SharedPreferences =
        context.getSharedPreferences("raahi_profile", Context.MODE_PRIVATE)

    suspend fun updateProfile(
        name: String,
        phone: String,
        address: String
    ): Result<User> {
        return try {
            // Try to update via API first
            val request = ProfileUpdateRequest(name = name, phone = phone, address = address)
            val response = profileService.updateProfile(request)

            if (response.isSuccessful && response.body()?.success == true) {
                val updatedApiUser = response.body()!!.data!!.user
                val updatedUser = convertApiUserToDataUser(updatedApiUser)

                // Save to local storage
                saveUserProfile(updatedUser)

                // Also update auth repository
                authRepository.saveCurrentUser(updatedUser)

                Result.success(updatedUser)
            } else {
                throw Exception(response.body()?.error ?: "Failed to update profile")
            }
        } catch (e: Exception) {
            // Fallback to local update for development/offline mode
            delay(800)

            val currentUser = getCurrentUser()
            if (currentUser != null) {
                val updatedUser = currentUser.copy(
                    name = name,
                    phone = phone,
                    address = address,
                    updatedAt = System.currentTimeMillis().toString()
                )

                saveUserProfile(updatedUser)
                // Also update auth repository to keep data consistent
                authRepository.saveCurrentUser(updatedUser)
                Result.success(updatedUser)
            } else {
                Result.failure(Exception("User not found"))
            }
        }
    }

    suspend fun updateEmergencyContacts(contacts: List<EmergencyContact>): Result<List<EmergencyContact>> {
        return try {
            // TODO: Implement API call when backend endpoint is available
            delay(600)

            val currentUser = getCurrentUser()
            if (currentUser != null) {
                val updatedUser = currentUser.copy(
                    emergencyContacts = contacts,
                    updatedAt = System.currentTimeMillis().toString()
                )

                saveUserProfile(updatedUser)
                authRepository.saveCurrentUser(updatedUser)
                Result.success(contacts)
            } else {
                Result.failure(Exception("User not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateLocationSettings(settings: LocationSettings): Result<LocationSettings> {
        return try {
            // TODO: Implement API call when backend endpoint is available
            delay(500)

            val currentUser = getCurrentUser()
            if (currentUser != null) {
                val updatedUser = currentUser.copy(
                    locationSettings = settings,
                    updatedAt = System.currentTimeMillis().toString()
                )

                saveUserProfile(updatedUser)
                authRepository.saveCurrentUser(updatedUser)
                Result.success(settings)
            } else {
                Result.failure(Exception("User not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateNotificationSettings(settings: NotificationSettings): Result<NotificationSettings> {
        return try {
            // TODO: Implement API call when backend endpoint is available
            delay(500)

            val currentUser = getCurrentUser()
            if (currentUser != null) {
                val updatedUser = currentUser.copy(
                    notificationSettings = settings,
                    updatedAt = System.currentTimeMillis().toString()
                )

                saveUserProfile(updatedUser)
                authRepository.saveCurrentUser(updatedUser)
                Result.success(settings)
            } else {
                Result.failure(Exception("User not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getCurrentUser(): User? {
        // Always get the primary user data from AuthRepository first
        // This ensures we have the latest registration/login data
        val baseUser = authRepository.getCurrentUser() ?: return null

        // Enhance with any profile-specific overrides from profile prefs (if any)
        val profileName = sharedPrefs.getString("user_name", null)
        val profilePhone = sharedPrefs.getString("user_phone", null)
        val profileAddress = sharedPrefs.getString("user_address", null)

        // Use profile data if it exists and is different, otherwise use auth data
        return baseUser.copy(
            name = profileName?.takeIf { it.isNotBlank() } ?: baseUser.name,
            phone = profilePhone?.takeIf { it.isNotBlank() } ?: baseUser.phone,
            address = profileAddress?.takeIf { it.isNotBlank() } ?: baseUser.address,
            // Add mock emergency contacts for now
            emergencyContacts = if (baseUser.emergencyContacts.isEmpty()) {
                listOf(
                    EmergencyContact("Emergency Services", "112", "Emergency"),
                    EmergencyContact("Demo Contact", "+1234567890", "Family")
                )
            } else {
                baseUser.emergencyContacts
            },
            locationSettings = LocationSettings(
                shareLocation = sharedPrefs.getBoolean("share_location", true),
                emergencyLocationSharing = sharedPrefs.getBoolean("emergency_location", true)
            ),
            notificationSettings = NotificationSettings(
                pushNotifications = sharedPrefs.getBoolean("push_notifications", true),
                emailNotifications = sharedPrefs.getBoolean("email_notifications", false),
                emergencyAlerts = sharedPrefs.getBoolean("emergency_alerts", true)
            )
        )
    }

    private fun saveUserProfile(user: User) {
        // Save to profile prefs
        sharedPrefs.edit()
            .putString("user_name", user.name)
            .putString("user_email", user.email)
            .putString("user_phone", user.phone)
            .putString("user_address", user.address)
            .putBoolean("share_location", user.locationSettings.shareLocation)
            .putBoolean("emergency_location", user.locationSettings.emergencyLocationSharing)
            .putBoolean("push_notifications", user.notificationSettings.pushNotifications)
            .putBoolean("email_notifications", user.notificationSettings.emailNotifications)
            .putBoolean("emergency_alerts", user.notificationSettings.emergencyAlerts)
            .apply()
    }

    // Convert API User model to Data User model
    private fun convertApiUserToDataUser(apiUser: com.example.rahi2.api.models.User): User {
        return User(
            id = apiUser.id,
            name = apiUser.name,
            email = apiUser.email,
            phone = apiUser.phone ?: "",
            address = apiUser.address ?: "",
            profilePicture = apiUser.profilePicture,
            emergencyContacts = apiUser.emergencyContacts.map { apiContact ->
                EmergencyContact(
                    name = apiContact.name,
                    phone = apiContact.phone,
                    relationship = apiContact.relationship ?: ""
                )
            },
            locationSettings = LocationSettings(
                shareLocation = apiUser.locationSettings.shareLocation,
                emergencyLocationSharing = apiUser.locationSettings.emergencyLocationSharing
            ),
            notificationSettings = NotificationSettings(
                pushNotifications = apiUser.notificationSettings.pushNotifications,
                emailNotifications = apiUser.notificationSettings.emailNotifications,
                emergencyAlerts = apiUser.notificationSettings.emergencyAlerts
            ),
            lastLogin = apiUser.lastLogin,
            createdAt = apiUser.createdAt,
            updatedAt = apiUser.updatedAt
        )
    }

    fun getProfileCompleteness(): Int {
        val user = getCurrentUser() ?: return 0

        var completeness = 0

        if (user.name.isNotBlank()) completeness += 25
        if (user.email.isNotBlank()) completeness += 25
        if (user.phone.isNotBlank()) completeness += 25
        if (user.address.isNotBlank()) completeness += 25

        // Bonus for emergency contacts
        if (user.emergencyContacts.isNotEmpty()) {
            completeness += 20
        }

        return minOf(completeness, 100)
    }
}