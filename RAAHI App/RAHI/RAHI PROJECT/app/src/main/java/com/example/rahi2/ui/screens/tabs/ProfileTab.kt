package com.example.rahi2.ui.screens.tabs

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
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.filled.Phone
import com.example.rahi2.data.User
import com.example.rahi2.repository.AuthRepository
import com.example.rahi2.repository.ProfileRepository
import kotlinx.coroutines.launch

@Composable
fun ProfileTab(onLogout: () -> Unit) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val authRepository = remember { AuthRepository(context) }
    val profileRepository = remember { ProfileRepository(context) }

    var currentUser by remember { mutableStateOf<User?>(null) }
    var isEditing by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }

    // Form fields
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }

    // Load user data
    LaunchedEffect(Unit) {
        // First try to refresh user data from server
        authRepository.refreshUserData().fold(
            onSuccess = { refreshedUser ->
                currentUser = refreshedUser
                name = refreshedUser.name
                email = refreshedUser.email
                address = refreshedUser.address
                phone = refreshedUser.phone
            },
            onFailure = {
                // Fall back to cached data
                currentUser = profileRepository.getCurrentUser()
                currentUser?.let { user ->
                    name = user.name
                    email = user.email
                    address = user.address
                    phone = user.phone
                }
            }
        )
    }

    fun handleSave() {
        if (name.isBlank()) {
            errorMessage = "Name cannot be empty"
            return
        }

        isLoading = true
        errorMessage = null
        successMessage = null

        coroutineScope.launch {
            profileRepository.updateProfile(name, phone, address).fold(
                onSuccess = { updatedUser ->
                    isLoading = false
                    isEditing = false
                    currentUser = updatedUser
                    // Update form fields with the latest data
                    name = updatedUser.name
                    email = updatedUser.email
                    phone = updatedUser.phone
                    address = updatedUser.address
                    successMessage = "Profile updated successfully!"
                },
                onFailure = { exception ->
                    isLoading = false
                    errorMessage = exception.message ?: "Failed to update profile"
                }
            )
        }
    }

    fun handleLogout() {
        authRepository.logout()
        onLogout()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.Start,
        verticalArrangement = Arrangement.Top
    ) {
        // Profile Header
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Surface(
                shape = CircleShape,
                color = MaterialTheme.colorScheme.primaryContainer,
                modifier = Modifier.size(72.dp)
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = "Profile Picture",
                        tint = MaterialTheme.colorScheme.onPrimaryContainer,
                        modifier = Modifier.size(36.dp)
                    )
                }
            }

            Column {
                Text(
                    currentUser?.name ?: "Loading...",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    currentUser?.email ?: "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.outline
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        HorizontalDivider()
        Spacer(modifier = Modifier.height(24.dp))

        // Profile completion indicator
        currentUser?.let { user ->
            val completeness = profileRepository.getProfileCompleteness()
            Text(
                "Profile Completeness: $completeness%",
                style = MaterialTheme.typography.bodyMedium,
                color = if (completeness == 100) Color.Green else MaterialTheme.colorScheme.outline
            )
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Status messages
        errorMessage?.let { error ->
            Text(
                text = error,
                color = Color.Red,
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        successMessage?.let { success ->
            Text(
                text = success,
                color = Color.Green,
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        Text(
            "Profile Information",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Medium
        )
        Spacer(modifier = Modifier.height(16.dp))

        if (!isEditing) {
            // Display mode
            Text(
                "Tap Edit to manage your profile details.",
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Emergency Contacts Section
            currentUser?.let { user ->
                val realContacts = user.emergencyContacts.filter {
                    it.phone.isNotBlank() && it.phone != "911" && it.phone != "112" && it.phone != "+1234567890"
                }

                androidx.compose.material3.Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = androidx.compose.material3.CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "Emergency Contacts (for SOS)",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )

                        if (realContacts.isEmpty()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                "⚠️ No emergency contacts added. SOS functionality will be limited.",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFFFF8F00)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                "Add emergency contacts to enable SOS messaging and calling features.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.outline
                            )
                        } else {
                            realContacts.forEach { contact ->
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            contact.name,
                                            style = MaterialTheme.typography.bodyMedium,
                                            fontWeight = FontWeight.Medium
                                        )
                                        Text(
                                            contact.phone,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.outline
                                        )
                                        if (contact.relationship.isNotBlank()) {
                                            Text(
                                                contact.relationship,
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.outline
                                            )
                                        }
                                    }
                                    Icon(
                                        Icons.Default.Phone,
                                        contentDescription = "Emergency Contact",
                                        tint = Color(0xFFD32F2F),
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
            }

            ElevatedButton(
                onClick = {
                    isEditing = true
                    errorMessage = null
                    successMessage = null
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isLoading
            ) {
                Text("Edit Profile")
            }
        } else {
            // Edit mode
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Name *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    enabled = !isLoading
                )

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    enabled = false, // Email shouldn't be editable
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                )

                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Phone Number") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    enabled = !isLoading,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                )

                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    label = { Text("Address") },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading,
                    minLines = 2
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ElevatedButton(
                    onClick = {
                        isEditing = false
                        errorMessage = null
                        successMessage = null
                        // Reset form fields
                        currentUser?.let { user ->
                            name = user.name
                            email = user.email
                            address = user.address
                            phone = user.phone
                        }
                    },
                    modifier = Modifier.weight(1f),
                    enabled = !isLoading
                ) {
                    Text("Cancel")
                }

                Button(
                    onClick = { handleSave() },
                    modifier = Modifier.weight(1f),
                    enabled = !isLoading && name.isNotBlank()
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            color = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                    } else {
                        Text("Save")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Logout button
        Button(
            onClick = { handleLogout() },
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading
        ) {
            Text("Logout")
        }
    }
}
