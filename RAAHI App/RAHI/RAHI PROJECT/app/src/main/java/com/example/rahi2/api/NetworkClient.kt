package com.example.rahi2.api

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.example.rahi2.api.services.AuthService
import com.example.rahi2.api.services.EmergencyService
import com.example.rahi2.api.services.ProfileService
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class NetworkClient private constructor(context: Context) {

    companion object {
        private const val BASE_URL = "http://10.0.2.2:3000/api/" // Android emulator localhost
        // Use "http://localhost:3000/api/" for physical device connected to same network

        private const val TOKEN_KEY = "auth_token"
        private const val PREFS_NAME = "raahi_secure_prefs"

        @Volatile
        private var INSTANCE: NetworkClient? = null

        fun getInstance(context: Context): NetworkClient {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: NetworkClient(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val encryptedPrefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        PREFS_NAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val authInterceptor = Interceptor { chain ->
        val originalRequest = chain.request()
        val token = getAuthToken()

        val newRequest = if (token != null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }

        chain.proceed(newRequest)
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val authService: AuthService = retrofit.create(AuthService::class.java)
    val profileService: ProfileService = retrofit.create(ProfileService::class.java)
    val emergencyService: EmergencyService = retrofit.create(EmergencyService::class.java)

    fun saveAuthToken(token: String) {
        encryptedPrefs.edit()
            .putString(TOKEN_KEY, token)
            .apply()
    }

    fun getAuthToken(): String? {
        return encryptedPrefs.getString(TOKEN_KEY, null)
    }

    fun clearAuthToken() {
        encryptedPrefs.edit()
            .remove(TOKEN_KEY)
            .apply()
    }

    fun isAuthenticated(): Boolean {
        return getAuthToken() != null
    }
}