package com.example.rahi2.repository

import android.content.Context
import android.content.SharedPreferences
import com.example.rahi2.data.User
import com.example.rahi2.data.AuthResponse
import com.example.rahi2.api.NetworkClient
import com.example.rahi2.api.models.LoginRequest
import com.example.rahi2.api.models.RegisterRequest
import com.example.rahi2.api.models.User as ApiUser
import kotlinx.coroutines.delay

class AuthRepository(private val context: Context) {

    private val networkClient = NetworkClient.getInstance(context)
    private val authService = networkClient.authService

    private val sharedPrefs: SharedPreferences =
        context.getSharedPreferences("raahi_auth", Context.MODE_PRIVATE)

    private val tokenKey = "auth_token"
    private val userKey = "current_user"

    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val request = LoginRequest(email, password)
            val response = authService.login(request)

            if (response.isSuccessful && response.body()?.success == true) {
                val apiAuthResponse = response.body()!!.data!!

                // Convert API models to data models
                val user = convertApiUserToDataUser(apiAuthResponse.user)
                val authResponse = AuthResponse(token = apiAuthResponse.token, user = user)

                // Save token and user locally
                networkClient.saveAuthToken(authResponse.token)
                saveCurrentUser(authResponse.user)

                Result.success(authResponse)
            } else {
                val errorMessage = response.body()?.error ?: "Login failed"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            // Fallback to mock behavior for development
            delay(1000)
            if (email.isNotEmpty() && password.length >= 6) {
                val user = User(
                    id = "user_${System.currentTimeMillis()}",
                    name = extractNameFromEmail(email),
                    email = email,
                    phone = "",
                    address = "",
                    createdAt = System.currentTimeMillis().toString()
                )

                val token = "mock_jwt_token_${System.currentTimeMillis()}"
                val authResponse = AuthResponse(token = token, user = user)

                networkClient.saveAuthToken(token)
                saveCurrentUser(user)

                Result.success(authResponse)
            } else {
                Result.failure(Exception("Invalid credentials"))
            }
        }
    }

    suspend fun register(
        name: String,
        email: String,
        password: String,
        phone: String,
        address: String
    ): Result<AuthResponse> {
        return try {
            val request = RegisterRequest(name, email, password, phone, address)
            val response = authService.register(request)

            if (response.isSuccessful && response.body()?.success == true) {
                val apiAuthResponse = response.body()!!.data!!

                // Convert API models to data models
                val user = convertApiUserToDataUser(apiAuthResponse.user)
                val authResponse = AuthResponse(token = apiAuthResponse.token, user = user)

                // Save token and user locally
                networkClient.saveAuthToken(authResponse.token)
                saveCurrentUser(authResponse.user)

                Result.success(authResponse)
            } else {
                val errorMessage = response.body()?.error ?: "Registration failed"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            // Fallback to mock behavior for development
            delay(1500)
            if (name.isNotEmpty() && email.isNotEmpty() && password.length >= 6) {
                val newUser = User(
                    id = "user_${System.currentTimeMillis()}",
                    name = name,
                    email = email,
                    phone = phone,
                    address = address,
                    createdAt = System.currentTimeMillis().toString()
                )

                val token = "mock_jwt_token_${System.currentTimeMillis()}"
                val authResponse = AuthResponse(token = token, user = newUser)

                networkClient.saveAuthToken(token)
                saveCurrentUser(newUser)

                Result.success(authResponse)
            } else {
                Result.failure(Exception("Invalid registration data"))
            }
        }
    }

    suspend fun refreshUserData(): Result<User> {
        return try {
            if (!networkClient.isAuthenticated()) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = authService.getCurrentUser()

            if (response.isSuccessful && response.body()?.success == true) {
                val apiUser = response.body()!!.data!!.user
                val user = convertApiUserToDataUser(apiUser)
                saveCurrentUser(user)
                Result.success(user)
            } else {
                Result.failure(Exception("Failed to refresh user data"))
            }
        } catch (e: Exception) {
            // Return cached user if network fails
            getCurrentUser()?.let { user ->
                Result.success(user)
            } ?: Result.failure(e)
        }
    }

    // Convert API User model to Data User model
    private fun convertApiUserToDataUser(apiUser: ApiUser): User {
        return User(
            id = apiUser.id,
            name = apiUser.name,
            email = apiUser.email,
            phone = apiUser.phone ?: "",
            address = apiUser.address ?: "",
            profilePicture = apiUser.profilePicture,
            emergencyContacts = apiUser.emergencyContacts.map { apiContact ->
                com.example.rahi2.data.EmergencyContact(
                    name = apiContact.name,
                    phone = apiContact.phone,
                    relationship = apiContact.relationship ?: ""
                )
            },
            locationSettings = com.example.rahi2.data.LocationSettings(
                shareLocation = apiUser.locationSettings.shareLocation,
                emergencyLocationSharing = apiUser.locationSettings.emergencyLocationSharing
            ),
            notificationSettings = com.example.rahi2.data.NotificationSettings(
                pushNotifications = apiUser.notificationSettings.pushNotifications,
                emailNotifications = apiUser.notificationSettings.emailNotifications,
                emergencyAlerts = apiUser.notificationSettings.emergencyAlerts
            ),
            lastLogin = apiUser.lastLogin,
            createdAt = apiUser.createdAt,
            updatedAt = apiUser.updatedAt
        )
    }

    fun logout() {
        networkClient.clearAuthToken()
        clearCurrentUser()
    }

    fun isAuthenticated(): Boolean {
        return networkClient.isAuthenticated()
    }

    fun getCurrentUser(): User? {
        // Get the stored user data
        val userId = sharedPrefs.getString(userKey, null)
        val userEmail = sharedPrefs.getString("user_email", null)
        val userName = sharedPrefs.getString("user_name", null)
        val userPhone = sharedPrefs.getString("user_phone", null)
        val userAddress = sharedPrefs.getString("user_address", null)
        val createdAt = sharedPrefs.getString("user_created_at", null)

        return if (userId != null && userEmail != null) {
            User(
                id = userId,
                name = userName ?: extractNameFromEmail(userEmail),
                email = userEmail,
                phone = userPhone ?: "",
                address = userAddress ?: "",
                createdAt = createdAt ?: System.currentTimeMillis().toString()
            )
        } else {
            null
        }
    }

    fun saveCurrentUser(user: User) {
        sharedPrefs.edit()
            .putString(userKey, user.id)
            .putString("user_email", user.email)
            .putString("user_name", user.name)
            .putString("user_phone", user.phone)
            .putString("user_address", user.address)
            .putString("user_created_at", user.createdAt)
            .apply()
    }

    private fun clearCurrentUser() {
        sharedPrefs.edit()
            .remove(userKey)
            .remove("user_email")
            .remove("user_name")
            .remove("user_phone")
            .remove("user_address")
            .remove("user_created_at")
            .apply()
    }

    // Helper function to extract name from email
    private fun extractNameFromEmail(email: String): String {
        return email.substringBefore("@")
            .split(".", "_", "-")
            .joinToString(" ") { it.replaceFirstChar { char -> char.uppercase() } }
    }
}