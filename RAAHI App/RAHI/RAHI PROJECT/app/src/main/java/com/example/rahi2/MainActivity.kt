package com.example.rahi2

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.example.rahi2.ui.theme.RAHI2Theme
import com.example.rahi2.navigation.AppNavHost
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.CompositionLocalProvider
import com.example.rahi2.ui.strings.EnglishStrings
import com.example.rahi2.ui.strings.HindiStrings
import com.example.rahi2.ui.strings.Language
import com.example.rahi2.ui.strings.LocalStrings

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            var currentLanguage by remember { mutableStateOf(Language.EN) }
            val strings = if (currentLanguage == Language.EN) EnglishStrings else HindiStrings

            CompositionLocalProvider(LocalStrings provides strings) {
                RAHI2Theme {
                    val navController = rememberNavController()
                    AppNavHost(
                        navController = navController,
                        modifier = Modifier.fillMaxSize(),
                        currentLanguage = currentLanguage,
                        onChangeLanguage = { newLanguage -> currentLanguage = newLanguage }
                    )
                }
            }
        }
    }
}
