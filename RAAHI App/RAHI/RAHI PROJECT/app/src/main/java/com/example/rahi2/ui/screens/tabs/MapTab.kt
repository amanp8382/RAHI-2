package com.example.rahi2.ui.screens.tabs

import android.Manifest
import android.app.PendingIntent
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddLocationAlt
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.example.rahi2.geofencing.GeofenceData
import com.example.rahi2.geofencing.GeofenceManager
import com.example.rahi2.ui.screens.CustomGeofenceDialog
import com.google.android.gms.location.Priority
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.Circle
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapType
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.launch
import java.util.Locale

@Composable
fun MapTab(
    onNavigateToGeofenceManagement: (() -> Unit)? = null
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var hasLocationPermission by remember { mutableStateOf(false) }
    var hasBackgroundLocationPermission by remember { mutableStateOf(false) }
    var currentLocation by remember { mutableStateOf<LatLng?>(null) }
    var currentMapType by remember { mutableStateOf(MapType.NORMAL) }
    var showMapTypeSelector by remember { mutableStateOf(false) }

    // Custom geofence creation states
    var isCreatingCustomGeofence by remember { mutableStateOf(false) }
    var showCustomGeofenceDialog by remember { mutableStateOf(false) }
    var selectedLocationForGeofence by remember { mutableStateOf<LatLng?>(null) }

    val geofenceManager = remember { GeofenceManager(context) }
    val geofencesList = remember { mutableStateListOf<GeofenceData>() }

    val defaultIndiaLatLng = LatLng(20.5937, 78.9629)
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(defaultIndiaLatLng, 5f)
    }

    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }

    val mapProperties by remember(currentMapType) {
        mutableStateOf(MapProperties(mapType = currentMapType))
    }

    val fineLocationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if (isGranted) {
                hasLocationPermission = true
            } else {
                hasLocationPermission = false
                Toast.makeText(context, "Fine location permission denied.", Toast.LENGTH_SHORT).show()
            }
        }
    )

    val backgroundLocationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if (isGranted) {
                hasBackgroundLocationPermission = true
            } else {
                hasBackgroundLocationPermission = false
                Toast.makeText(context, "Background location permission denied. Geofences might not work in background.", Toast.LENGTH_LONG).show()
            }
        }
    )

    fun checkAndRequestPermissions() {
        when {
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED -> {
                hasLocationPermission = true
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    when (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_BACKGROUND_LOCATION)) {
                        PackageManager.PERMISSION_GRANTED -> hasBackgroundLocationPermission = true
                        else -> { /* Consider prompting for background permission */ }
                    }
                } else {
                    hasBackgroundLocationPermission = true
                }
            }
            else -> {
                fineLocationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
            }
        }
    }

    fun fetchCurrentLocation() {
        if (hasLocationPermission) {
            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, CancellationTokenSource().token)
                .addOnSuccessListener { location ->
                    if (location != null) {
                        currentLocation = LatLng(location.latitude, location.longitude)
                        cameraPositionState.position = CameraPosition.fromLatLngZoom(currentLocation!!, 15f)
                    }
                }
                .addOnFailureListener { 
                    Toast.makeText(context, "Failed to get current location.", Toast.LENGTH_SHORT).show()
                }
        } else {
            checkAndRequestPermissions()
        }
    }

    var locationCallback: com.google.android.gms.location.LocationCallback? by remember {
        mutableStateOf(
            null
        )
    }

    fun startLocationUpdates() {
        if (!hasLocationPermission) return

        locationCallback?.let { callback ->
            fusedLocationClient.removeLocationUpdates(callback)
        }

        val locationRequest = com.google.android.gms.location.LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            2000L // Update every 2 seconds
        ).apply {
            setMinUpdateIntervalMillis(1000L) // Minimum 1 second between updates
            setMaxUpdateDelayMillis(5000L) // Maximum 5 seconds delay
            setWaitForAccurateLocation(false) // Don't wait for perfect accuracy
        }.build()

        val callback = object : com.google.android.gms.location.LocationCallback() {
            override fun onLocationResult(locationResult: com.google.android.gms.location.LocationResult) {
                locationResult.lastLocation?.let { location ->
                    val newLocation = LatLng(location.latitude, location.longitude)
                    currentLocation = newLocation

                    val currentPos = cameraPositionState.position.target
                    val distance = android.location.Location("").apply {
                        latitude = currentPos.latitude
                        longitude = currentPos.longitude
                    }.distanceTo(android.location.Location("").apply {
                        latitude = newLocation.latitude
                        longitude = newLocation.longitude
                    })

                    if (distance > 10 && !cameraPositionState.isMoving) {
                        coroutineScope.launch {
                            try {
                                cameraPositionState.animate(
                                    com.google.android.gms.maps.CameraUpdateFactory.newLatLng(
                                        newLocation
                                    ),
                                    1000 // 1 second animation
                                )
                            } catch (e: Exception) {
                                // Ignore animation errors
                            }
                        }
                    }
                }
            }
        }

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                callback,
                android.os.Looper.getMainLooper()
            )
            locationCallback = callback
        } catch (e: SecurityException) {
            Toast.makeText(
                context,
                "Location permission required for smooth GPS tracking",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    fun stopLocationUpdates() {
        locationCallback?.let { callback ->
            fusedLocationClient.removeLocationUpdates(callback)
            locationCallback = null
        }
    }

    fun loadExistingGeofences() {
        val existingGeofences = geofenceManager.getAllGeofences()
        geofencesList.clear()
        geofencesList.addAll(existingGeofences)
        android.util.Log.d("MapTab", "Loaded ${existingGeofences.size} geofences")
    }

    var refreshTrigger by remember { mutableStateOf(0) }

    LaunchedEffect(refreshTrigger) {
        loadExistingGeofences()
    }

    LaunchedEffect(Unit) {
        checkAndRequestPermissions()
        loadExistingGeofences()
    }

    LaunchedEffect(hasLocationPermission) {
        if (hasLocationPermission) {
            if (currentLocation == null) {
                fetchCurrentLocation()
            }
            startLocationUpdates()
        }
    }

    val mapTypes = listOf(MapType.NORMAL, MapType.SATELLITE, MapType.TERRAIN, MapType.HYBRID)

    fun addGeofenceAtCurrentLocation() {
        if (!hasLocationPermission) {
            Toast.makeText(context, "Fine Location permission needed to add geofence.", Toast.LENGTH_SHORT).show()
            checkAndRequestPermissions()
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && !hasBackgroundLocationPermission) {
             when (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_BACKGROUND_LOCATION)) {
                PackageManager.PERMISSION_GRANTED -> hasBackgroundLocationPermission = true
                else -> backgroundLocationPermissionLauncher.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
            }
            if (!hasBackgroundLocationPermission) { 
                 Toast.makeText(context, "Background location permission is recommended for geofences to work reliably.", Toast.LENGTH_LONG).show()
            }
        }

        currentLocation?.let { loc ->
            coroutineScope.launch {
                val result = geofenceManager.addGeofenceAtLocation(
                    latLng = loc,
                    name = "Current Location Geofence",
                    radius = 100f
                )

                result.fold(
                    onSuccess = { geofenceId ->
                        Toast.makeText(context, "Geofence added successfully!", Toast.LENGTH_SHORT)
                            .show()
                        refreshTrigger++ // Force refresh
                    },
                    onFailure = { exception ->
                        Toast.makeText(
                            context,
                            "Failed to add geofence: ${exception.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                )
            }
        } ?: run {
            Toast.makeText(context, "Current location not available.", Toast.LENGTH_SHORT).show()
            if (!hasLocationPermission) fetchCurrentLocation()
        }
    }

    fun addCustomGeofence(name: String, radius: Float, color: Long, location: LatLng) {
        coroutineScope.launch {
            val geofenceData = GeofenceData(
                id = java.util.UUID.randomUUID().toString(),
                latitude = location.latitude,
                longitude = location.longitude,
                radius = radius,
                name = name,
                color = color
            )

            val result = geofenceManager.addGeofence(geofenceData)
            result.fold(
                onSuccess = {
                    Toast.makeText(context, "Custom geofence '$name' created!", Toast.LENGTH_SHORT)
                        .show()
                    refreshTrigger++ // Force refresh
                },
                onFailure = { exception ->
                    android.util.Log.e("MapTab", "Failed to create geofence: ${exception.message}")
                    Toast.makeText(
                        context,
                        "Failed to create geofence: ${exception.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            )
        }
    }

    fun removeAllGeofences() {
        coroutineScope.launch {
            val result = geofenceManager.removeAllGeofences()
            result.fold(
                onSuccess = {
                    Toast.makeText(context, "All geofences removed!", Toast.LENGTH_SHORT).show()
                    geofencesList.clear()
                    refreshTrigger++ // Force refresh
                },
                onFailure = { exception ->
                    Toast.makeText(
                        context,
                        "Failed to remove geofences: ${exception.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            )
        }
    }

    androidx.compose.runtime.DisposableEffect(Unit) {
        onDispose {
            stopLocationUpdates()
        }
    }

    val displayedGeofences by remember { derivedStateOf { geofencesList.toList() } }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(
                        Color(0xFF0F2027),
                        Color(0xFF203A43),
                        Color(0xFF2C5364)
                    )
                )
            )
    ) {
        if (hasLocationPermission) {
            GoogleMap(
                modifier = Modifier.matchParentSize(),
                cameraPositionState = cameraPositionState,
                properties = mapProperties,
                onMapClick = { latLng ->
                    if (isCreatingCustomGeofence) {
                        selectedLocationForGeofence = latLng
                        showCustomGeofenceDialog = true
                        isCreatingCustomGeofence = false
                    }
                }
            ) {
                currentLocation?.let {
                    Marker(
                        state = MarkerState(position = it),
                        title = "Current Location"
                    )
                }

                // Display all geofences as circles with their custom colors
                displayedGeofences.forEachIndexed { _, geofenceData ->
                    val center = LatLng(geofenceData.latitude, geofenceData.longitude)
                    val geofenceColor = try {
                        androidx.compose.ui.graphics.Color(geofenceData.color)
                    } catch (e: Exception) {
                        // Use default color if invalid
                        androidx.compose.ui.graphics.Color.Blue
                    }

                    Circle(
                        center = center,
                        radius = geofenceData.radius.toDouble(),
                        strokeColor = geofenceColor.copy(alpha = 0.8f),
                        fillColor = geofenceColor.copy(alpha = 0.3f),
                        strokeWidth = 3f
                    )

                    // Add a marker for the geofence center
                    Marker(
                        state = MarkerState(position = center),
                        title = geofenceData.name,
                        snippet = "Radius: ${geofenceData.radius.toInt()}m"
                    )
                }

                // Show temporary marker for selected location
                selectedLocationForGeofence?.let { location ->
                    Marker(
                        state = MarkerState(position = location),
                        title = "Selected Location"
                    )
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    "Location permission is required to display the map and your current location.",
                    color = Color.White,
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.bodyLarge
                )
                Button(onClick = { fineLocationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION) }) {
                    Text("Grant Fine Location Permission")
                }
                 if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(onClick = { backgroundLocationPermissionLauncher.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION) }) {
                        Text("Grant Background Location (Recommended)")
                    }
                }
            }
        }

        // Dropdown Map Type Selector (Top Right)
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(top = 16.dp, end = 16.dp)
                .wrapContentSize(Alignment.TopEnd)
        ) {
            Button(
                onClick = { showMapTypeSelector = !showMapTypeSelector },
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Black.copy(alpha = 0.5f),
                    contentColor = Color.White
                ),
                elevation = ButtonDefaults.buttonElevation(0.dp, 0.dp)
            ) {
                Text(
                    currentMapType.name.lowercase(Locale.getDefault()).replaceFirstChar { it.titlecase(Locale.getDefault()) },
                    fontSize = 14.sp
                )
            }
            DropdownMenu(
                expanded = showMapTypeSelector,
                onDismissRequest = { showMapTypeSelector = false },
                modifier = Modifier.background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.9f))
            ) {
                mapTypes.forEach { mapType ->
                    DropdownMenuItem(
                        text = { 
                            Text(
                                mapType.name.lowercase(Locale.getDefault()).replaceFirstChar { it.titlecase(Locale.getDefault()) },
                                fontSize = 16.sp
                            )
                        },
                        onClick = {
                            currentMapType = mapType
                            showMapTypeSelector = false
                        }
                    )
                }
            }
        }

        // Geofence count indicator (Top Left)
        if (displayedGeofences.isNotEmpty()) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(top = 16.dp, start = 16.dp)
            ) {
                Button(
                    onClick = { onNavigateToGeofenceManagement?.invoke() },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.Green.copy(alpha = 0.7f),
                        contentColor = Color.White
                    ),
                    elevation = ButtonDefaults.buttonElevation(0.dp, 0.dp)
                ) {
                    Text("${displayedGeofences.size} Geofences", fontSize = 12.sp)
                }
            }
        }


        // Geofence creation mode indicator (Center)
        if (isCreatingCustomGeofence) {
            Box(
                modifier = Modifier
                    .align(Alignment.Center)
                    .padding(16.dp)
            ) {
                androidx.compose.material3.Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = androidx.compose.material3.CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    ),
                    elevation = androidx.compose.material3.CardDefaults.cardElevation(
                        defaultElevation = 8.dp
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            "Tap on the map to place geofence",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = { isCreatingCustomGeofence = false },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error
                            )
                        ) {
                            Text("Cancel")
                        }
                    }
                }
            }
        }

        // FABs Column (Bottom Left)
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Quick geofence at current location 
            FloatingActionButton(
                onClick = { addGeofenceAtCurrentLocation() },
                containerColor = MaterialTheme.colorScheme.primaryContainer
            ) {
                Icon(Icons.Filled.AddLocationAlt, "Quick Geofence Here")
            }

            // Custom geofence creation
            FloatingActionButton(
                onClick = {
                    if (!isCreatingCustomGeofence) {
                        isCreatingCustomGeofence = true
                        Toast.makeText(
                            context,
                            "Tap anywhere on the map to place a custom geofence",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                },
                containerColor = if (isCreatingCustomGeofence)
                    MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.7f)
                else
                    MaterialTheme.colorScheme.secondaryContainer
            ) {
                Icon(Icons.Filled.Edit, "Custom Geofence")
            }

            if (geofencesList.isNotEmpty()) {
                FloatingActionButton(
                    onClick = { removeAllGeofences() },
                    containerColor = MaterialTheme.colorScheme.errorContainer
                ) {
                    Icon(Icons.Filled.Clear, "Remove All Geofences")
                }
            }

            FloatingActionButton(
                onClick = { fetchCurrentLocation() },
                containerColor = MaterialTheme.colorScheme.tertiaryContainer
            ) {
                Icon(Icons.Filled.MyLocation, "Center on my location")
            }
        }


        if (showCustomGeofenceDialog) {
            CustomGeofenceDialog(
                onDismiss = {
                    showCustomGeofenceDialog = false
                    selectedLocationForGeofence = null
                },
                onConfirm = { name, radius, color ->
                    selectedLocationForGeofence?.let { location ->
                        addCustomGeofence(name, radius, color, location)
                    }
                    showCustomGeofenceDialog = false
                    selectedLocationForGeofence = null
                }
            )
        }
    }
}
