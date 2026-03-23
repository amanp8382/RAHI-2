package com.example.rahi2.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.rahi2.geofencing.GeofenceData
import com.example.rahi2.geofencing.GeofenceManager
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GeofenceManagementScreen(
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val geofenceManager = remember { GeofenceManager(context) }

    var geofences by remember { mutableStateOf<List<GeofenceData>>(emptyList()) }
    var geofenceEvents by remember { mutableStateOf<List<String>>(emptyList()) }
    var selectedTabIndex by remember { mutableStateOf(0) }

    fun loadData() {
        geofences = geofenceManager.getAllGeofences()
        geofenceEvents = geofenceManager.getGeofenceEvents()
    }

    LaunchedEffect(Unit) {
        loadData()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Geofence Management") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    if (selectedTabIndex == 1 && geofenceEvents.isNotEmpty()) {
                        IconButton(
                            onClick = {
                                geofenceManager.clearGeofenceEvents()
                                loadData()
                            }
                        ) {
                            Icon(Icons.Filled.Clear, contentDescription = "Clear Events")
                        }
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Tab Row
            TabRow(selectedTabIndex = selectedTabIndex) {
                Tab(
                    selected = selectedTabIndex == 0,
                    onClick = { selectedTabIndex = 0 },
                    text = { Text("Geofences (${geofences.size})") }
                )
                Tab(
                    selected = selectedTabIndex == 1,
                    onClick = { selectedTabIndex = 1 },
                    text = { Text("Events (${geofenceEvents.size})") }
                )
            }

            // Content based on selected tab
            when (selectedTabIndex) {
                0 -> GeofencesList(
                    geofences = geofences,
                    onRemoveGeofence = { geofenceId ->
                        coroutineScope.launch {
                            geofenceManager.removeGeofences(listOf(geofenceId))
                            loadData()
                        }
                    }
                )

                1 -> EventsList(events = geofenceEvents)
            }
        }
    }
}

@Composable
private fun GeofencesList(
    geofences: List<GeofenceData>,
    onRemoveGeofence: (String) -> Unit
) {
    if (geofences.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    Icons.Filled.LocationOn,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.outline
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    "No geofences created yet",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.outline
                )
                Text(
                    "Go to the Map tab to create geofences",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.outline
                )
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(geofences) { geofence ->
                GeofenceItem(
                    geofence = geofence,
                    onRemove = { onRemoveGeofence(geofence.id) }
                )
            }
        }
    }
}

@Composable
private fun GeofenceItem(
    geofence: GeofenceData,
    onRemove: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Color indicator circle
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(
                        Color(geofence.color),
                        shape = CircleShape
                    )
                    .border(
                        width = 2.dp,
                        color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                        shape = CircleShape
                    )
            ) {
                Icon(
                    Icons.Filled.LocationOn,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier
                        .size(20.dp)
                        .align(Alignment.Center)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = geofence.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "${String.format("%.4f", geofence.latitude)}, ${
                        String.format(
                            "%.4f",
                            geofence.longitude
                        )
                    }",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.outline
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Radius: ${geofence.radius.toInt()}m",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.outline
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(
                                Color(geofence.color),
                                shape = CircleShape
                            )
                    )
                }
            }

            IconButton(
                onClick = onRemove,
                colors = IconButtonDefaults.iconButtonColors(
                    contentColor = MaterialTheme.colorScheme.error
                )
            ) {
                Icon(Icons.Filled.Delete, contentDescription = "Remove Geofence")
            }
        }
    }
}

@Composable
private fun EventsList(events: List<String>) {
    if (events.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    "No geofence events yet",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.outline
                )
                Text(
                    "Events will appear here when you enter or exit geofences",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.outline
                )
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(events) { event ->
                EventItem(event = event)
            }
        }
    }
}

@Composable
private fun EventItem(event: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            // Parse the event string to extract information
            val parts = event.split(", ")
            var timestamp = ""
            var type = ""
            var geofenceId = ""
            var location = ""

            parts.forEach { part ->
                when {
                    part.startsWith("Timestamp: ") -> {
                        val timestampLong = part.substringAfter("Timestamp: ").toLongOrNull()
                        timestamp = timestampLong?.let {
                            SimpleDateFormat("MMM dd, yyyy HH:mm:ss", Locale.getDefault()).format(
                                Date(it)
                            )
                        } ?: "Unknown time"
                    }

                    part.startsWith("Type: ") -> type = part.substringAfter("Type: ")
                    part.startsWith("GeofenceId: ") -> geofenceId =
                        part.substringAfter("GeofenceId: ")

                    part.startsWith("Location: ") -> location = part.substringAfter("Location: ")
                }
            }

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(
                            color = if (type == "ENTER") Color.Green else Color.Red,
                            shape = RoundedCornerShape(4.dp)
                        )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (type == "ENTER") "Entered" else "Exited",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = if (type == "ENTER") Color.Green else Color.Red
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = timestamp,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.outline
            )

            if (location.isNotEmpty()) {
                Text(
                    text = "Location: $location",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.outline
                )
            }

            Text(
                text = "Geofence: ${geofenceId.take(8)}...",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.outline
            )
        }
    }
}