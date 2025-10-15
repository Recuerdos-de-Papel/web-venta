package com.tallerreparaciones.asistente.voice

import java.util.Locale

sealed interface VoiceCommand {
    data class NewOrder(val orderNumber: String?, val machineType: String?, val clientName: String?) : VoiceCommand
    data class AddPart(val name: String, val price: Double, val quantity: Int = 1) : VoiceCommand
    data class SetBudget(val total: Double) : VoiceCommand
    data class MarkStatus(val orderNumber: String, val status: String) : VoiceCommand
    data class EarningsQuery(val range: String) : VoiceCommand
    data object ShowPending : VoiceCommand
    data class SendEstimate(val orderNumber: String, val clientName: String?) : VoiceCommand
    data class Reminder(val clientName: String, val message: String?) : VoiceCommand
    data class SearchPart(val query: String) : VoiceCommand
    data object Unknown : VoiceCommand
}

object NlpCommandParser {
    fun parse(input: String): VoiceCommand {
        val text = input.lowercase(Locale("es", "ES")).trim()

        if (text.startsWith("nueva reparación") || text.startsWith("registra nueva reparación") || text.startsWith("nueva reparacion")) {
            return VoiceCommand.NewOrder(null, null, null)
        }
        if (text.startsWith("agregar repuesto") || text.startsWith("añadir repuesto")) {
            val after = text.substringAfter(":", "").trim()
            val name = after.substringBeforeLast(" ").substringBeforeLast(" ")
            val price = Regex("(\\d+[\\.,]\\d+|\\d+)").find(after)?.value?.replace(",", ".")?.toDoubleOrNull() ?: 0.0
            return VoiceCommand.AddPart(name.ifBlank { after }, price)
        }
        if (text.startsWith("presupuesto total")) {
            val number = Regex("(\\d+[\\.,]\\d+|\\d+)").find(text)?.value?.replace(",", ".")?.toDoubleOrNull()
            if (number != null) return VoiceCommand.SetBudget(number)
        }
        if (text.contains("completada") || text.contains("cobrada") || text.contains("pendiente") || text.contains("en proceso")) {
            val order = Regex("orden\\s+(\\d+)").find(text)?.groupValues?.getOrNull(1)
            if (order != null) {
                val status = when {
                    text.contains("cobr") -> "cobrada"
                    text.contains("complet") -> "completada"
                    text.contains("pend") -> "pendiente"
                    else -> "en proceso"
                }
                return VoiceCommand.MarkStatus(order, status)
            }
        }
        if (text.contains("cuánto") && text.contains("gan") && (text.contains("semana") || text.contains("hoy") || text.contains("mes"))) {
            val range = when {
                text.contains("semana") -> "week"
                text.contains("hoy") -> "today"
                else -> "month"
            }
            return VoiceCommand.EarningsQuery(range)
        }
        if (text.contains("mostrar") && text.contains("pendientes")) return VoiceCommand.ShowPending
        if (text.startsWith("envía presupuesto") || text.startsWith("envia presupuesto")) {
            val order = Regex("orden\\s+(\\d+)").find(text)?.groupValues?.getOrNull(1)
            val client = Regex("a\\s+([a-záéíóúñ\\s]+)$").find(text)?.groupValues?.getOrNull(1)?.trim()
            return VoiceCommand.SendEstimate(order ?: "", client)
        }
        if (text.startsWith("recordarle a ")) {
            val name = text.removePrefix("recordarle a ").substringBefore(" que ").trim()
            val msg = text.substringAfter(" que ", "").trim().ifBlank { null }
            if (name.isNotBlank()) return VoiceCommand.Reminder(name, msg)
        }
        if (text.startsWith("busca precio")) {
            return VoiceCommand.SearchPart(text.removePrefix("busca precio").trim())
        }
        if (text.contains("mostrar reparaciones pendientes")) return VoiceCommand.ShowPending
        return VoiceCommand.Unknown
    }
}
