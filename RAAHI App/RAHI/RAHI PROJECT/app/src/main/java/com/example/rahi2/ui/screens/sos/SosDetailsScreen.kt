package com.example.rahi2.ui.screens.sos

import android.Manifest
import android.content.Intent as AndroidIntent
import android.content.pm.PackageManager
import android.location.Location
import android.net.Uri
import android.telephony.SmsManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.example.rahi2.repository.AuthRepository
import com.example.rahi2.repository.ProfileRepository
import com.example.rahi2.data.EmergencyContact
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SosDetailsScreen(navController: NavController) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    // Repositories
    val authRepository = remember { AuthRepository(context) }
    val profileRepository = remember { ProfileRepository(context) }

    // State variables
    var userName by remember { mutableStateOf("") }
    var userPhone by remember { mutableStateOf("") }
    var emergencyContacts by remember { mutableStateOf<List<EmergencyContact>>(emptyList()) }
    var currentLocation by remember { mutableStateOf<Location?>(null) }
    var isFetchingLocation by remember { mutableStateOf(false) }
    var isLoadingProfile by remember { mutableStateOf(true) }
    var selectedContact by remember { mutableStateOf<EmergencyContact?>(null) }

    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }

    fun fetchDeviceLocation() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            isFetchingLocation = true
            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, CancellationTokenSource().token)
                .addOnSuccessListener { location: Location? ->
                    currentLocation = location
                    isFetchingLocation = false
                    if (location == null) {
                        Toast.makeText(
                            context,
                            "Unable to get precise location. Ensure GPS is enabled.",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
                .addOnFailureListener {
                    isFetchingLocation = false
                    Toast.makeText(context, "Location error: ${it.message}", Toast.LENGTH_SHORT)
                        .show()
                }
        }
    }

    // Load user profile data
    LaunchedEffect(Unit) {
        isLoadingProfile = true
        val currentUser = profileRepository.getCurrentUser()
        currentUser?.let { user ->
            userName = user.name
            userPhone = user.phone
            emergencyContacts = user.emergencyContacts.filter {
                it.phone.isNotBlank() && it.phone != "911" && it.phone != "112" && it.phone != "+1234567890"
            }
            if (emergencyContacts.isNotEmpty()) {
                selectedContact = emergencyContacts.first()
            }
        }
        isLoadingProfile = false

        // Auto-fetch location
        fetchDeviceLocation()
    }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if (isGranted) {
                fetchDeviceLocation()
            } else {
                Toast.makeText(
                    context,
                    "Location permission is needed for emergency services to find you.",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    )

    val smsPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if (isGranted) {
                Toast.makeText(
                    context,
                    "SMS permission granted. You can now send SOS messages.",
                    Toast.LENGTH_SHORT
                ).show()
            } else {
                Toast.makeText(
                    context,
                    "SMS permission is required to send emergency alerts.",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    )

    val callPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if (isGranted) {
                selectedContact?.let { contact ->
                    val intent =
                        AndroidIntent(AndroidIntent.ACTION_CALL, Uri.parse("tel:${contact.phone}"))
                    context.startActivity(intent)
                }
            } else {
                Toast.makeText(
                    context,
                    "Phone permission denied. Using dialer instead.",
                    Toast.LENGTH_SHORT
                ).show()
                selectedContact?.let { contact ->
                    val intent =
                        AndroidIntent(AndroidIntent.ACTION_DIAL, Uri.parse("tel:${contact.phone}"))
                    context.startActivity(intent)
                }
            }
        }
    )

    fun sendSosSms() {
        val contact = selectedContact
        if (contact == null) {
            Toast.makeText(context, "Please select an emergency contact first.", Toast.LENGTH_SHORT)
                .show()
            return
        }

        if (ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            smsPermissionLauncher.launch(Manifest.permission.SEND_SMS)
            return
        }

        val locationText = currentLocation?.let {
            "Location: https://maps.google.com/?q=${it.latitude},${it.longitude} (Lat: ${
                String.format(
                    "%.6f",
                    it.latitude
                )
            }, Lng: ${String.format("%.6f", it.longitude)})"
        } ?: "Location: Unable to determine current location"

        val smsMessage = "🚨 EMERGENCY SOS 🚨\n" +
                "From: $userName\n" +
                "Phone: $userPhone\n" +
                "$locationText\n" +
                "Time: ${
                    java.text.SimpleDateFormat(
                        "MMM dd, yyyy HH:mm",
                        java.util.Locale.getDefault()
                    ).format(java.util.Date())
                }\n" +
                "Please send help immediately!"

        try {
            val smsManager = SmsManager.getDefault()
            val parts = smsManager.divideMessage(smsMessage)
            smsManager.sendMultipartTextMessage(contact.phone, null, parts, null, null)
            Toast.makeText(
                context,
                "SOS message sent to ${contact.name} (${contact.phone})",
                Toast.LENGTH_LONG
            ).show()
        } catch (e: Exception) {
            Toast.makeText(context, "Failed to send SOS: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    fun initiateEmergencyCall() {
        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CALL_PHONE
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            val intent = AndroidIntent(AndroidIntent.ACTION_CALL, Uri.parse("tel:112"))
            context.startActivity(intent)
        } else {
            callPermissionLauncher.launch(Manifest.permission.CALL_PHONE)
        }
    }

    fun callEmergencyContact() {
        val contact = selectedContact
        if (contact == null) {
            Toast.makeText(context, "Please select an emergency contact first.", Toast.LENGTH_SHORT)
                .show()
            return
        }

        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CALL_PHONE
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            val intent = AndroidIntent(AndroidIntent.ACTION_CALL, Uri.parse("tel:${contact.phone}"))
            context.startActivity(intent)
        } else {
            callPermissionLauncher.launch(Manifest.permission.CALL_PHONE)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Emergency SOS",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            Icons.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFFD32F2F) // Emergency red
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Emergency Alert Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEEEE))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        "🚨 EMERGENCY ALERT 🚨",
                        style = MaterialTheme.typography.titleLarge,
                        color = Color(0xFFD32F2F),
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "This will send your location and contact information to your selected emergency contact.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF666666)
                    )
                }
            }

            if (isLoadingProfile) {
                CircularProgressIndicator(color = Color(0xFFD32F2F))
            } else {
                // User Information Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "Your Information",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = userName,
                            onValueChange = { userName = it },
                            label = { Text("Your Name") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = userPhone,
                            onValueChange = { userPhone = it },
                            label = { Text("Your Phone Number") },
                            modifier = Modifier.fillMaxWidth(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            singleLine = true
                        )
                    }
                }

                // Location Information Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = Color(0xFFD32F2F)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Current Location",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        if (isFetchingLocation) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    color = Color(0xFFD32F2F)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    "Getting your location...",
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        } else {
                            Text(
                                text = currentLocation?.let {
                                    "Latitude: ${
                                        String.format(
                                            "%.6f",
                                            it.latitude
                                        )
                                    }\nLongitude: ${String.format("%.6f", it.longitude)}"
                                } ?: "Location not available",
                                style = MaterialTheme.typography.bodyMedium,
                                color = if (currentLocation != null) MaterialTheme.colorScheme.onSurfaceVariant else Color(
                                    0xFFD32F2F
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedButton(
                            onClick = {
                                if (ContextCompat.checkSelfPermission(
                                        context,
                                        Manifest.permission.ACCESS_FINE_LOCATION
                                    ) == PackageManager.PERMISSION_GRANTED
                                ) {
                                    fetchDeviceLocation()
                                } else {
                                    locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.LocationOn, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Refresh Location")
                        }
                    }
                }

                // Emergency Contacts Selection
                if (emergencyContacts.isNotEmpty()) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                "Emergency Contact",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            emergencyContacts.forEach { contact ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(
                                        selected = selectedContact == contact,
                                        onClick = { selectedContact = contact }
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(contact.name, fontWeight = FontWeight.Medium)
                                        Text(
                                            contact.phone,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Color.Gray
                                        )
                                        if (contact.relationship.isNotBlank()) {
                                            Text(
                                                "(${contact.relationship})",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = Color.Gray
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF3E0))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                "⚠️ No Emergency Contacts",
                                style = MaterialTheme.typography.titleMedium,
                                color = Color(0xFFFF8F00)
                            )
                            Text(
                                "Please add emergency contacts in your profile for SOS functionality.",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Action Buttons
                if (selectedContact != null) {
                    Button(
                        onClick = { sendSosSms() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F)),
                        enabled = userName.isNotBlank() && userPhone.isNotBlank()
                    ) {
                        Icon(Icons.Default.Sms, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Send SOS Message", color = Color.White, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedButton(
                        onClick = { callEmergencyContact() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFD32F2F))
                    ) {
                        Icon(Icons.Default.Phone, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Call ${selectedContact?.name}", fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Emergency Services
                Button(
                    onClick = { initiateEmergencyCall() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1976D2))
                ) {
                    Icon(Icons.Default.Phone, contentDescription = null, tint = Color.White)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Call Emergency Services (112)",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
