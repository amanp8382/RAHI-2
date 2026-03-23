package com.example.rahi2.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.rahi2.ui.strings.Language

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    selectedLanguage: Language,
    onChangeLanguage: (Language) -> Unit
    // darkMode: Boolean, // Removed
    // onToggleDarkMode: (Boolean) -> Unit // Removed
) {
    Column(modifier = Modifier.fillMaxSize()) { // New parent Column
        TopAppBar(
            title = { Text("Settings") }
        )
        Column(
            modifier = Modifier
                .fillMaxSize() // This Column will take the remaining space
                .padding(16.dp)
        ) {
            // Text("Dark Mode", style = MaterialTheme.typography.titleMedium) // Removed
            // Switch(checked = darkMode, onCheckedChange = onToggleDarkMode) // Removed
            // Spacer(modifier = Modifier.height(16.dp)) // Removed
            Text("Language", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp)) // Added a smaller spacer for consistent padding
            SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                SegmentedButton(
                    selected = selectedLanguage == Language.EN,
                    onClick = { onChangeLanguage(Language.EN) },
                    shape = SegmentedButtonDefaults.itemShape(index = 0, count = 2),
                    label = { Text("English") }
                )
                SegmentedButton(
                    selected = selectedLanguage == Language.HI,
                    onClick = { onChangeLanguage(Language.HI) },
                    shape = SegmentedButtonDefaults.itemShape(index = 1, count = 2),
                    label = { Text("	हिंदी") }
                )
            }
        }
    }
}
