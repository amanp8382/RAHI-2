package com.example.rahi2.ui.screens.tabs

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Report
import androidx.compose.material.icons.filled.Sos
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.rahi2.ui.strings.LocalStrings

@Composable
fun HomeTab(
    onReportIncident: () -> Unit, 
    onOpenMap: () -> Unit,
	onNavigateToSosDetails: () -> Unit,
	onNavigateToGeofenceManagement: (() -> Unit)? = null
) {
	val context = LocalContext.current // Still needed for LocalStrings
    val currentStrings = LocalStrings.current

	val sosAccentColor = Color(0xFFFF3D00)
	val mapAccentColor = Color(0xFF42A5F5)
	val reportAccentColor = Color(0xFF66BB6A)
	val geofenceAccentColor = Color(0xFF9C27B0)

	Column(
		modifier = Modifier
			.fillMaxSize()
			.background(Color.White)
			.padding(16.dp),
		horizontalAlignment = Alignment.CenterHorizontally,
		verticalArrangement = Arrangement.Top
	) {
		Row(
			modifier = Modifier.fillMaxWidth(),
			horizontalArrangement = Arrangement.Start,
			verticalAlignment = Alignment.CenterVertically
		) {
			Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
			Text(
				text = currentStrings.appTitle,
				style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground),
				modifier = Modifier.padding(start = 8.dp)
			)
		}
		Spacer(modifier = Modifier.height(16.dp))

		FeatureCard(
			title = currentStrings.homeSOS,
			accentColor = sosAccentColor,
			icon = { Icon(Icons.Default.Sos, contentDescription = null, tint = sosAccentColor, modifier = Modifier.size(36.dp)) },
			onClick = onNavigateToSosDetails // Updated onClick
		)
		Spacer(modifier = Modifier.height(12.dp))
		FeatureCard(
			title = currentStrings.homeMap,
			accentColor = mapAccentColor,
			icon = { Icon(Icons.Default.Map, contentDescription = null, tint = mapAccentColor, modifier = Modifier.size(36.dp)) },
			onClick = onOpenMap
		)
		Spacer(modifier = Modifier.height(12.dp))

		// Add geofence management card if navigation is provided
		onNavigateToGeofenceManagement?.let { navigate ->
			FeatureCard(
				title = "Geofence Management",
				accentColor = geofenceAccentColor,
				icon = {
					Icon(
						Icons.Default.LocationOn,
						contentDescription = null,
						tint = geofenceAccentColor,
						modifier = Modifier.size(36.dp)
					)
				},
				onClick = navigate
			)
			Spacer(modifier = Modifier.height(12.dp))
		}

		FeatureCard(
			title = currentStrings.homeReportIncident,
			accentColor = reportAccentColor,
			icon = { Icon(Icons.Default.Report, contentDescription = null, tint = reportAccentColor, modifier = Modifier.size(36.dp)) },
			onClick = onReportIncident
		)
	}
}

@Composable
private fun FeatureCard(
	title: String,
	accentColor: Color,
	icon: @Composable () -> Unit,
	onClick: () -> Unit
) {
	Card(
		colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
		shape = RoundedCornerShape(18.dp),
		modifier = Modifier
			.fillMaxWidth()
			.height(100.dp)
			.clickable { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
	) {
		Row(
			modifier = Modifier
				.fillMaxSize()
				.padding(16.dp),
			verticalAlignment = Alignment.CenterVertically,
			horizontalArrangement = Arrangement.spacedBy(16.dp)
		) {
			Box(
				modifier = Modifier
					.size(56.dp)
					.background(accentColor.copy(alpha = 0.1f), shape = RoundedCornerShape(12.dp)),
				contentAlignment = Alignment.Center
			) { icon() }
			Text(title, style = MaterialTheme.typography.titleLarge, color = accentColor)
		}
	}
}


