package com.example.rahi2.geofencing

import android.Manifest
import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingClient
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.model.LatLng
import kotlinx.coroutines.suspendCancellableCoroutine
import java.util.UUID
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

data class GeofenceData(
    val id: String,
    val latitude: Double,
    val longitude: Double,
    val radius: Float,
    val expirationDuration: Long = Geofence.NEVER_EXPIRE,
    val transitionTypes: Int = Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_EXIT,
    val name: String = "Geofence $id",
    val color: Long = 0xFF42A5F5L // Default blue color
)

class GeofenceManager(private val context: Context) {

    companion object {
        private const val TAG = "GeofenceManager"
        private const val DEFAULT_RADIUS = 100f
    }

    private val geofencingClient: GeofencingClient = LocationServices.getGeofencingClient(context)
    private val geofencePendingIntent: PendingIntent by lazy {
        val intent = Intent(context, GeofenceBroadcastReceiver::class.java)
        PendingIntent.getBroadcast(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
    }

    /**
     * Add a single geofence
     */
    suspend fun addGeofence(geofenceData: GeofenceData): Result<String> {
        return try {
            if (!hasLocationPermission()) {
                Log.e(TAG, "Location permission not granted")
                Result.failure(SecurityException("Location permission not granted"))
            } else {
                val geofence = createGeofence(geofenceData)
                val geofencingRequest = GeofencingRequest.Builder()
                    .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER or GeofencingRequest.INITIAL_TRIGGER_EXIT)
                    .addGeofence(geofence)
                    .build()

                addGeofencesInternal(geofencingRequest, geofenceData.id)
                saveGeofenceData(geofenceData)
                Log.d(TAG, "Successfully added geofence: ${geofenceData.name}")
                Result.success(geofenceData.id)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to add geofence: ${e.message}", e)
            Result.failure(e)
        }
    }

    /**
     * Add a geofence at a specific location with default radius
     */
    suspend fun addGeofenceAtLocation(
        latLng: LatLng,
        name: String = "Custom Geofence",
        radius: Float = DEFAULT_RADIUS
    ): Result<String> {
        val geofenceId = UUID.randomUUID().toString()
        val geofenceData = GeofenceData(
            id = geofenceId,
            latitude = latLng.latitude,
            longitude = latLng.longitude,
            radius = radius,
            name = name
        )
        return addGeofence(geofenceData)
    }

    /**
     * Add multiple geofences
     */
    suspend fun addGeofences(geofenceDataList: List<GeofenceData>): Result<List<String>> {
        return try {
            if (!hasLocationPermission()) {
                Result.failure(SecurityException("Location permission not granted"))
            } else {
                val geofences = geofenceDataList.map { createGeofence(it) }
                val geofencingRequest = GeofencingRequest.Builder()
                    .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER or GeofencingRequest.INITIAL_TRIGGER_EXIT)
                    .addGeofences(geofences)
                    .build()

                val requestIds = geofenceDataList.map { it.id }
                addGeofencesInternal(geofencingRequest, requestIds.joinToString(","))

                // Save all geofence data
                geofenceDataList.forEach { saveGeofenceData(it) }

                Result.success(requestIds)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to add geofences: ${e.message}")
            Result.failure(e)
        }
    }

    /**
     * Remove geofences by IDs
     */
    suspend fun removeGeofences(geofenceIds: List<String>): Result<Unit> {
        return suspendCancellableCoroutine { continuation ->
            geofencingClient.removeGeofences(geofenceIds)
                .addOnSuccessListener {
                    // Remove from local storage
                    geofenceIds.forEach { removeGeofenceData(it) }
                    Log.i(TAG, "Geofences removed successfully: ${geofenceIds.joinToString()}")
                    continuation.resume(Result.success(Unit))
                }
                .addOnFailureListener { exception ->
                    Log.e(TAG, "Failed to remove geofences: ${exception.message}")
                    continuation.resume(Result.failure(exception))
                }
        }
    }

    /**
     * Remove all geofences
     */
    suspend fun removeAllGeofences(): Result<Unit> {
        return suspendCancellableCoroutine { continuation ->
            geofencingClient.removeGeofences(geofencePendingIntent)
                .addOnSuccessListener {
                    clearAllGeofenceData()
                    Log.i(TAG, "All geofences removed successfully")
                    continuation.resume(Result.success(Unit))
                }
                .addOnFailureListener { exception ->
                    Log.e(TAG, "Failed to remove all geofences: ${exception.message}")
                    continuation.resume(Result.failure(exception))
                }
        }
    }

    /**
     * Get all stored geofences
     */
    fun getAllGeofences(): List<GeofenceData> {
        val sharedPrefs = context.getSharedPreferences("geofences", Context.MODE_PRIVATE)
        val geofenceIds = sharedPrefs.getStringSet("geofence_ids", emptySet()) ?: emptySet()

        return geofenceIds.mapNotNull { id ->
            val geofenceJson = sharedPrefs.getString("geofence_$id", null)
            geofenceJson?.let { parseGeofenceData(it) }
        }
    }

    /**
     * Get geofence events from local storage
     */
    fun getGeofenceEvents(): List<String> {
        val sharedPrefs = context.getSharedPreferences("geofence_events", Context.MODE_PRIVATE)
        val events = sharedPrefs.getStringSet("events", emptySet()) ?: emptySet()
        return events.toList().sortedDescending() // Most recent first
    }

    /**
     * Clear all geofence events
     */
    fun clearGeofenceEvents() {
        val sharedPrefs = context.getSharedPreferences("geofence_events", Context.MODE_PRIVATE)
        sharedPrefs.edit().remove("events").apply()
    }

    // Private helper methods

    private fun createGeofence(geofenceData: GeofenceData): Geofence {
        return Geofence.Builder()
            .setRequestId(geofenceData.id)
            .setCircularRegion(
                geofenceData.latitude,
                geofenceData.longitude,
                geofenceData.radius
            )
            .setExpirationDuration(geofenceData.expirationDuration)
            .setTransitionTypes(geofenceData.transitionTypes)
            .setLoiteringDelay(30000) // 30 seconds loitering delay for more stable detection
            .setNotificationResponsiveness(5000) // 5 seconds responsiveness for faster detection
            .build()
    }

    @SuppressLint("MissingPermission")
    private suspend fun addGeofencesInternal(
        geofencingRequest: GeofencingRequest,
        requestIdForLogging: String
    ) {
        suspendCancellableCoroutine<Unit> { continuation ->
            geofencingClient.addGeofences(geofencingRequest, geofencePendingIntent)
                .addOnSuccessListener {
                    Log.i(TAG, "Geofence(s) added successfully: $requestIdForLogging")
                    continuation.resume(Unit)
                }
                .addOnFailureListener { exception ->
                    Log.e(TAG, "Failed to add geofence(s): ${exception.message}")
                    continuation.resumeWithException(exception)
                }
        }
    }

    private fun hasLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun saveGeofenceData(geofenceData: GeofenceData) {
        val sharedPrefs = context.getSharedPreferences("geofences", Context.MODE_PRIVATE)
        val geofenceIds = sharedPrefs.getStringSet("geofence_ids", mutableSetOf())?.toMutableSet()
            ?: mutableSetOf()

        geofenceIds.add(geofenceData.id)

        val geofenceJson = geofenceDataToJson(geofenceData)

        val success = sharedPrefs.edit()
            .putStringSet("geofence_ids", geofenceIds)
            .putString("geofence_${geofenceData.id}", geofenceJson)
            .commit() // Use commit() instead of apply() to ensure immediate save

        if (!success) {
            Log.e(TAG, "Failed to save geofence data")
        }
    }

    private fun removeGeofenceData(geofenceId: String) {
        val sharedPrefs = context.getSharedPreferences("geofences", Context.MODE_PRIVATE)
        val geofenceIds = sharedPrefs.getStringSet("geofence_ids", mutableSetOf())?.toMutableSet()
            ?: mutableSetOf()

        geofenceIds.remove(geofenceId)

        sharedPrefs.edit()
            .putStringSet("geofence_ids", geofenceIds)
            .remove("geofence_$geofenceId")
            .apply()
    }

    private fun clearAllGeofenceData() {
        val sharedPrefs = context.getSharedPreferences("geofences", Context.MODE_PRIVATE)
        sharedPrefs.edit().clear().apply()
    }

    private fun geofenceDataToJson(geofenceData: GeofenceData): String {
        // Simple JSON serialization - in production, consider using a proper JSON library
        return buildString {
            append("{")
            append("\"id\":\"${geofenceData.id}\",")
            append("\"latitude\":${geofenceData.latitude},")
            append("\"longitude\":${geofenceData.longitude},")
            append("\"radius\":${geofenceData.radius},")
            append("\"expirationDuration\":${geofenceData.expirationDuration},")
            append("\"transitionTypes\":${geofenceData.transitionTypes},")
            append("\"name\":\"${geofenceData.name}\",")
            append("\"color\":${geofenceData.color}")
            append("}")
        }
    }

    private fun parseGeofenceData(json: String): GeofenceData? {
        return try {
            // More robust JSON parsing
            val idMatch = Regex("\"id\":\"([^\"]+)\"").find(json)
            val latitudeMatch = Regex("\"latitude\":([\\d.-]+)").find(json)
            val longitudeMatch = Regex("\"longitude\":([\\d.-]+)").find(json)
            val radiusMatch = Regex("\"radius\":([\\d.]+)").find(json)
            val expirationMatch = Regex("\"expirationDuration\":([\\d-]+)").find(json)
            val transitionMatch = Regex("\"transitionTypes\":([\\d]+)").find(json)
            val nameMatch = Regex("\"name\":\"([^\"]+)\"").find(json)
            val colorMatch = Regex("\"color\":([\\d]+)").find(json)

            if (idMatch == null || latitudeMatch == null || longitudeMatch == null ||
                radiusMatch == null || expirationMatch == null || transitionMatch == null ||
                nameMatch == null
            ) {
                Log.e(TAG, "Missing required fields in JSON")
                return null
            }

            val id = idMatch.groupValues[1]
            val latitude = latitudeMatch.groupValues[1].toDouble()
            val longitude = longitudeMatch.groupValues[1].toDouble()
            val radius = radiusMatch.groupValues[1].toFloat()
            val expirationDuration = expirationMatch.groupValues[1].toLong()
            val transitionTypes = transitionMatch.groupValues[1].toInt()
            val name = nameMatch.groupValues[1]
            val color = colorMatch?.groupValues?.get(1)?.toLongOrNull() ?: 0xFF42A5F5L

            GeofenceData(
                id = id,
                latitude = latitude,
                longitude = longitude,
                radius = radius,
                expirationDuration = expirationDuration,
                transitionTypes = transitionTypes,
                name = name,
                color = color
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to parse geofence data", e)
            null
        }
    }
}