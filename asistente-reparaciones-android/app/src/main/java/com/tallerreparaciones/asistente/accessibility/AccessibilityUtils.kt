package com.tallerreparaciones.asistente.accessibility

import android.view.accessibility.AccessibilityNodeInfo

object AccessibilityUtils {
    fun AccessibilityNodeInfo.children(): Sequence<AccessibilityNodeInfo> =
        (0 until childCount).asSequence().mapNotNull { getChild(it) }

    fun AccessibilityNodeInfo.findByTextRecursively(text: String): AccessibilityNodeInfo? {
        if (this.text?.toString()?.contains(text, ignoreCase = true) == true) return this
        for (child in children()) {
            val found = child.findByTextRecursively(text)
            if (found != null) return found
        }
        return null
    }
}
