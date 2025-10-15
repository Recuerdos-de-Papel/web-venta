package com.tallerreparaciones.asistente.ui.orders

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun OrderListScreen(onOpenOrder: (Long) -> Unit) {
    val sample = remember {
        listOf(
            OrderItemUi(1, "Orden 298", "Lavadora Samsung", "pendiente"),
            OrderItemUi(2, "Orden 299", "Refrigerador LG", "en proceso"),
            OrderItemUi(3, "Orden 300", "Microondas", "completada")
        )
    }
    Scaffold(topBar = { SmallTopAppBar(title = { Text("Órdenes") }) }) { padding ->
        LazyColumn(Modifier.padding(padding)) {
            items(sample) {
                ListItem(
                    headlineContent = { Text(it.title) },
                    supportingContent = { Text(it.subtitle) },
                    trailingContent = { Text(it.status) },
                    modifier = Modifier.clickable { onOpenOrder(it.id) }
                )
                Divider()
            }
        }
    }
}

data class OrderItemUi(val id: Long, val title: String, val subtitle: String, val status: String)
