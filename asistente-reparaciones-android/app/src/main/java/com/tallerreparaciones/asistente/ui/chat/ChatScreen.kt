package com.tallerreparaciones.asistente.ui.chat

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ChatScreen(onNavigate: (String) -> Unit) {
    var messages by remember { mutableStateOf(listOf("Hola, soy tu asistente. Di 'Nueva reparación'")) }

    Scaffold(
        topBar = {
            SmallTopAppBar(title = { Text("Asistente") }, actions = {
                TextButton(onClick = { onNavigate("dashboard") }) { Text("Dashboard") }
                TextButton(onClick = { onNavigate("orders") }) { Text("Órdenes") }
            })
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { /* activar voz */ }) { Text("🎤") }
        }
    ) { padding ->
        Column(Modifier.padding(padding)) {
            LazyColumn(Modifier.weight(1f).padding(16.dp)) {
                items(messages) { msg -> Text(msg); Spacer(Modifier.height(8.dp)) }
            }
            Row(Modifier.padding(16.dp)) {
                OutlinedTextField(value = "", onValueChange = {}, modifier = Modifier.weight(1f))
                Spacer(Modifier.width(8.dp))
                Button(onClick = { /* enviar */ }) { Text("Enviar") }
            }
        }
    }
}
