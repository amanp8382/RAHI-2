package com.example.rahi2.api.services

import com.example.rahi2.api.models.*
import retrofit2.Response
import retrofit2.http.*

interface AuthService {
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<AuthResponse>>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<AuthResponse>>

    @GET("auth/me")
    suspend fun getCurrentUser(): Response<ApiResponse<UserResponse>>

    @POST("auth/logout")
    suspend fun logout(): Response<ApiResponse<Unit>>

    @PUT("auth/change-password")
    suspend fun changePassword(@Body request: ChangePasswordRequest): Response<ApiResponse<Unit>>
}

interface ProfileService {
    @PUT("profile/update")
    suspend fun updateProfile(@Body request: ProfileUpdateRequest): Response<ApiResponse<ProfileUpdateResponse>>

    @PUT("profile/emergency-contacts")
    suspend fun updateEmergencyContacts(@Body request: EmergencyContactsRequest): Response<ApiResponse<EmergencyContactsResponse>>

    @PUT("profile/location-settings")
    suspend fun updateLocationSettings(@Body request: LocationSettingsRequest): Response<ApiResponse<LocationSettingsResponse>>

    @PUT("profile/notification-settings")
    suspend fun updateNotificationSettings(@Body request: NotificationSettingsRequest): Response<ApiResponse<NotificationSettingsResponse>>

    @GET("profile/stats")
    suspend fun getUserStats(): Response<ApiResponse<UserStatsResponse>>

    @DELETE("profile/delete")
    suspend fun deleteAccount(): Response<ApiResponse<Unit>>
}

interface EmergencyService {
    @POST("emergency/report")
    suspend fun reportEmergency(@Body request: EmergencyReportRequest): Response<ApiResponse<EmergencyReportResponse>>

    @GET("emergency/status/{reportId}")
    suspend fun getEmergencyStatus(@Path("reportId") reportId: String): Response<ApiResponse<EmergencyStatusResponse>>
}

// Response wrapper models
data class UserResponse(val user: User)
data class ProfileUpdateResponse(val user: User)
data class EmergencyContactsResponse(val emergencyContacts: List<EmergencyContact>)
data class LocationSettingsResponse(val locationSettings: LocationSettings)
data class NotificationSettingsResponse(val notificationSettings: NotificationSettings)
data class UserStatsResponse(val stats: UserStats)