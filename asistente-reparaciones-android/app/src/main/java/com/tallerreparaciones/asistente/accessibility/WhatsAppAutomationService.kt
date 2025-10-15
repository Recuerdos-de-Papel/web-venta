package com.tallerreparaciones.asistente.accessibility

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.net.Uri
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.tallerreparaciones.asistente.accessibility.AccessibilityUtils.findByTextRecursively

class WhatsAppAutomationService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // En este MVP dejamos preparado el hook para automatizar:
        // 1) Abrir chat por intent "wa.me" o API de WhatsApp
        // 2) Detectar campo de texto y botón enviar
    }

    override fun onInterrupt() { }

    private fun findNodeByText(root: AccessibilityNodeInfo?, text: String): AccessibilityNodeInfo? {
        if (root == null) return null
        val nodes = root.findAccessibilityNodeInfosByText(text)
        return nodes.firstOrNull()
    }

    fun openWhatsAppChat(phoneOrQuery: String, prefill: String? = null) {
        // Intenta abrir chat directo por número con mensaje prellenado
        val uri = if (prefill.isNullOrBlank()) {
            Uri.parse("https://wa.me/$phoneOrQuery")
        } else {
            Uri.parse("https://wa.me/$phoneOrQuery?text=" + Uri.encode(prefill))
        }
        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            setPackage("com.whatsapp")
        }
        runCatching { startActivity(intent) }
    }
}
