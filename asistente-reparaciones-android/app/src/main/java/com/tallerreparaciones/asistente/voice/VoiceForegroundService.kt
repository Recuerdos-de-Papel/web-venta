package com.tallerreparaciones.asistente.voice

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder

class VoiceForegroundService : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startForeground(1001, createNotification())
    }

    private fun createNotification(): Notification {
        val channelId = "voice_channel"
        val channelName = "Control por voz"
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_LOW)
            manager.createNotificationChannel(channel)
        }
        return Notification.Builder(this, channelId)
            .setContentTitle("Asistente de Reparaciones")
            .setContentText("Modo manos libres activo")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .build()
    }
}
