package com.example.rahi2.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onFinished: () -> Unit) {
	val visible = remember { mutableStateOf(false) }

	LaunchedEffect(Unit) {
		visible.value = true
		delay(1200)
		onFinished()
	}

	Column(
		modifier = Modifier.fillMaxSize(),
		horizontalAlignment = Alignment.CenterHorizontally,
		verticalArrangement = Arrangement.Center
	) {
		AnimatedVisibility(visible = visible.value, enter = fadeIn(), exit = fadeOut()) {
			Column(horizontalAlignment = Alignment.CenterHorizontally) {
				Icon(
					imageVector = Icons.Default.VerifiedUser,
					contentDescription = "App Logo",
					modifier = Modifier.size(96.dp),
					tint = MaterialTheme.colorScheme.primary
				)
				Text(
					text = "Smart Tourist Safety",
					style = MaterialTheme.typography.headlineMedium.copy(
						fontWeight = FontWeight.Bold,
						fontSize = 28.sp
					)
				)
			}
		}
	}
}


