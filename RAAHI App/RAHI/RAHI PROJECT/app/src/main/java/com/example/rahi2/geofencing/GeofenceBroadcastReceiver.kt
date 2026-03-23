package com.example.rahi2.geofencing

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.rahi2.MainActivity
import com.example.rahi2.R
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofenceStatusCodes
import com.google.android.gms.location.GeofencingEvent

class GeofenceBroadcastReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "GeofenceReceiver"
        private const val NOTIFICATION_CHANNEL_ID = "geofence_channel"
        private const val NOTIFICATION_ID = 1001
    }

    override fun onReceive(context: Context, intent: Intent) {
        val geofencingEvent = GeofencingEvent.fromIntent(intent)
        if (geofencingEvent == null) {
            Log.e(TAG, "GeofencingEvent is null")
            return
        }

        if (geofencingEvent.hasError()) {
            val errorMessage = GeofenceStatusCodes
                .getStatusCodeString(geofencingEvent.errorCode)
            Log.e(TAG, "GeofencingEvent error: $errorMessage")
            sendNotification(context, "Geofence Error", errorMessage)
            return
        }

        // Get the location that triggered the geofence
        val triggeringLocation = geofencingEvent.triggeringLocation

        // Get the transition type.
        val geofenceTransition = geofencingEvent.geofenceTransition

        // Test that the reported transition was of interest.
        when (geofenceTransition) {
            Geofence.GEOFENCE_TRANSITION_ENTER -> {
                handleGeofenceTransition(context, geofencingEvent, "ENTERED", "🟢")
            }

            Geofence.GEOFENCE_TRANSITION_EXIT -> {
                handleGeofenceTransition(context, geofencingEvent, "EXITED", "🔴")
            }

            Geofence.GEOFENCE_TRANSITION_DWELL -> {
                handleGeofenceTransition(context, geofencingEvent, "DWELLING IN", "🟡")
            }

            else -> {
                val errorMsg =
                    "Geofence transition error: invalid transition type $geofenceTransition"
                Log.e(TAG, errorMsg)
                sendNotification(context, "Geofence Error", errorMsg)
            }
        }
    }

    private fun handleGeofenceTransition(
        context: Context,
        geofencingEvent: GeofencingEvent,
        actionText: String,
        emoji: String
    ) {
        // Get the geofences that were triggered
        val triggeringGeofences = geofencingEvent.triggeringGeofences
        val triggeringLocation = geofencingEvent.triggeringLocation

        if (triggeringGeofences.isNullOrEmpty()) {
            Log.w(TAG, "No triggering geofences found")
            return
        }

        triggeringGeofences.forEach { geofence ->
            val geofenceName = getGeofenceName(context, geofence.requestId)
            val locationInfo = triggeringLocation?.let {
                " at ${String.format("%.4f", it.latitude)}, ${String.format("%.4f", it.longitude)}"
            } ?: ""

            val message = "$emoji $actionText $geofenceName$locationInfo"
            Log.i(TAG, message)

            // Send individual notification for each geofence
            sendNotification(
                context,
                "Location Alert",
                message
            )

            // Store geofence event
            storeGeofenceEvent(
                context,
                geofencingEvent.geofenceTransition,
                geofence.requestId,
                triggeringLocation
            )
        }
    }

    private fun getGeofenceName(context: Context, geofenceId: String): String {
        // Try to get the geofence name from stored data
        val sharedPrefs = context.getSharedPreferences("geofences", Context.MODE_PRIVATE)
        val geofenceJson = sharedPrefs.getString("geofence_$geofenceId", null)

        return if (geofenceJson != null) {
            try {
                val nameMatch = Regex("\"name\":\"([^\"]+)\"").find(geofenceJson)
                nameMatch?.groupValues?.get(1) ?: "Unknown Geofence"
            } catch (e: Exception) {
                "Geofence ${geofenceId.take(8)}"
            }
        } else {
            "Geofence ${geofenceId.take(8)}"
        }
    }

    private fun sendNotification(context: Context, title: String, message: String) {
        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create notification channel for Android O and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Geofence Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for geofence entry and exit events"
                enableVibration(true)
                setShowBadge(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Create intent to open the app when notification is tapped
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher) // You may want to create a specific geofence icon
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun storeGeofenceEvent(
        context: Context,
        transitionType: Int,
        geofenceId: String,
        location: android.location.Location?
    ) {
        // Here you can implement storing geofence events to SharedPreferences, 
        // local database, or send to your backend server
        val sharedPrefs = context.getSharedPreferences("geofence_events", Context.MODE_PRIVATE)
        val timestamp = System.currentTimeMillis()

        val eventData = buildString {
            append("Timestamp: $timestamp, ")
            append("Type: ${if (transitionType == Geofence.GEOFENCE_TRANSITION_ENTER) "ENTER" else "EXIT"}, ")
            append("GeofenceId: $geofenceId")
            location?.let {
                append(", Location: ${it.latitude}, ${it.longitude}")
            }
        }

        // Store the latest events (keep last 50 events)
        val existingEvents = sharedPrefs.getStringSet("events", mutableSetOf()) ?: mutableSetOf()
        val eventsList = existingEvents.toMutableList()
        eventsList.add(eventData)

        // Keep only the last 50 events
        if (eventsList.size > 50) {
            eventsList.removeAt(0)
        }

        sharedPrefs.edit()
            .putStringSet("events", eventsList.toSet())
            .apply()

        Log.d(TAG, "Stored geofence event: $eventData")
    }
}
