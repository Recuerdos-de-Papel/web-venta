package com.tallerreparaciones.asistente.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.tallerreparaciones.asistente.ui.chat.ChatScreen
import com.tallerreparaciones.asistente.ui.dashboard.DashboardScreen
import com.tallerreparaciones.asistente.ui.orders.OrderDetailScreen
import com.tallerreparaciones.asistente.ui.orders.OrderListScreen

@Composable
fun AppNav(modifier: Modifier = Modifier, navController: NavHostController = rememberNavController()) {
    NavHost(navController = navController, startDestination = "chat") {
        composable("chat") {
            ChatScreen(onNavigate = { route -> navController.navigate(route) })
        }
        composable("dashboard") {
            DashboardScreen()
        }
        composable("orders") {
            OrderListScreen(onOpenOrder = { id -> navController.navigate("order/$id") })
        }
        composable("order/{id}") {
            val id = it.arguments?.getString("id")?.toLongOrNull()
            if (id != null) OrderDetailScreen(orderId = id)
        }
    }
}
