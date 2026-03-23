package com.example.rahi2.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog

data class GeofenceColor(
    val name: String,
    val color: Color,
    val colorValue: Long
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomGeofenceDialog(
    onDismiss: () -> Unit,
    onConfirm: (name: String, radius: Float, color: Long) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var radiusText by remember { mutableStateOf("100") }
    var selectedColorIndex by remember { mutableStateOf(0) }

    val availableColors = remember {
        listOf(
            GeofenceColor("Blue", Color(0xFF42A5F5), 0xFF42A5F5L),
            GeofenceColor("Red", Color(0xFFF44336), 0xFFF44336L),
            GeofenceColor("Green", Color(0xFF4CAF50), 0xFF4CAF50L),
            GeofenceColor("Purple", Color(0xFF9C27B0), 0xFF9C27B0L),
            GeofenceColor("Orange", Color(0xFFFF9800), 0xFFFF9800L),
            GeofenceColor("Teal", Color(0xFF009688), 0xFF009688L),
            GeofenceColor("Pink", Color(0xFFE91E63), 0xFFE91E63L),
            GeofenceColor("Indigo", Color(0xFF3F51B5), 0xFF3F51B5L),
            GeofenceColor("Cyan", Color(0xFF00BCD4), 0xFF00BCD4L),
            GeofenceColor("Lime", Color(0xFFCDDC39), 0xFFCDDC39L)
        )
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Create Custom Geofence",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Filled.Close, contentDescription = "Close")
                    }
                }

                // Name input
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Geofence Name") },
                    placeholder = { Text("e.g., Home, Work, School") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                // Radius input
                OutlinedTextField(
                    value = radiusText,
                    onValueChange = { newValue ->
                        if (newValue.isEmpty() || newValue.all { it.isDigit() }) {
                            radiusText = newValue
                        }
                    },
                    label = { Text("Radius (meters)") },
                    placeholder = { Text("100") },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    supportingText = {
                        Text("Minimum: 50m, Maximum: 5000m")
                    }
                )

                // Color selection
                Column {
                    Text(
                        text = "Select Color",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(availableColors.size) { index ->
                            val colorItem = availableColors[index]
                            val isSelected = selectedColorIndex == index

                            Box(
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                                    .background(colorItem.color)
                                    .border(
                                        width = if (isSelected) 3.dp else 1.dp,
                                        color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Gray,
                                        shape = CircleShape
                                    )
                                    .clickable { selectedColorIndex = index },
                                contentAlignment = Alignment.Center
                            ) {
                                if (isSelected) {
                                    Box(
                                        modifier = Modifier
                                            .size(16.dp)
                                            .background(Color.White, CircleShape)
                                    )
                                }
                            }
                        }
                    }

                    Text(
                        text = "Selected: ${availableColors[selectedColorIndex].name}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.outline,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }

                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = {
                            val radius = radiusText.toFloatOrNull()?.coerceIn(50f, 5000f) ?: 100f
                            val geofenceName = if (name.isBlank()) "Custom Geofence" else name
                            onConfirm(
                                geofenceName,
                                radius,
                                availableColors[selectedColorIndex].colorValue
                            )
                        },
                        modifier = Modifier.weight(1f),
                        enabled = radiusText.isNotBlank()
                    ) {
                        Text("Create")
                    }
                }
            }
        }
    }
}