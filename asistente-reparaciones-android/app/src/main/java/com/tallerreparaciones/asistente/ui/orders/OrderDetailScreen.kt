package com.tallerreparaciones.asistente.ui.orders

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun OrderDetailScreen(orderId: Long) {
    Scaffold(topBar = { SmallTopAppBar(title = { Text("Orden #$orderId") }) }) { padding ->
        Column(Modifier.padding(padding).padding(16.dp)) {
            Text("Detalle de la orden (en progreso)")
            Spacer(Modifier.height(12.dp))
            Button(onClick = { /* Enviar WhatsApp */ }) { Text("Enviar presupuesto por WhatsApp") }
        }
    }
}
