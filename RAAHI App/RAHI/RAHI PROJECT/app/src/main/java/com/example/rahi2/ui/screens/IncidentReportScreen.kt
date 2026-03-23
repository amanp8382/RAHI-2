package com.example.rahi2.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IncidentReportScreen(onBack: () -> Unit) {
	val snackbarHostState = remember { SnackbarHostState() }
	var description by remember { mutableStateOf("") }
	var location by remember { mutableStateOf("") }
	val scope = rememberCoroutineScope()

	Scaffold(
		topBar = { TopAppBar(title = { Text("Report Incident") }) },
		snackbarHost = { SnackbarHost(snackbarHostState) }
	) { inner ->
		Column(
			modifier = Modifier
				.fillMaxSize()
				.padding(inner)
				.padding(16.dp)
		) {
			TextField(
				value = description,
				onValueChange = { description = it },
				label = { Text("Description") },
				modifier = Modifier.fillMaxWidth()
			)
			Spacer(modifier = Modifier.height(12.dp))
			TextField(
				value = location,
				onValueChange = { location = it },
				label = { Text("Location") },
				modifier = Modifier.fillMaxWidth()
			)
			Spacer(modifier = Modifier.height(20.dp))
			Button(onClick = {
				scope.launch {
					snackbarHostState.showSnackbar("Incident submitted!")
					onBack()
				}
			}, modifier = Modifier.fillMaxWidth()) {
				Text("Submit")
			}
		}
	}
}


