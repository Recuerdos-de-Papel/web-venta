# Asistente de Reparaciones (Android / Kotlin)

Aplicación nativa con control por voz para gestionar reparaciones de máquinas.

## Requisitos
- Android Studio Ladybug o superior
- JDK 17

## Módulos clave
- Jetpack Compose + Material 3
- Hilt (DI)
- Room (DB local)
- WorkManager (tareas en background)
- AccessibilityService (automatizar WhatsApp)
- SpeechRecognizer + TextToSpeech

## Compilación
1. Abrir el proyecto en Android Studio
2. Sincronizar Gradle
3. Ejecutar en dispositivo con Android 8.0+ (API 26+)

## Permisos
El primer arranque solicitará permisos de micrófono, cámara y notificaciones. Para SMS, contactos y llamadas se solicitarán cuando se usen.

## Activar el servicio de Accesibilidad
1. Ajustes > Accesibilidad > Servicios instalados
2. Activar "Asistente Reparaciones - Automatización WhatsApp"

## Comandos de voz (ejemplos)
- "Nueva reparación"
- "Lavadora Samsung, orden 245, cliente Juan Pérez"
- "Agregar repuesto: motor 150 dólares"
- "Presupuesto total 300 dólares"
- "Marcar orden 245 como completada"
- "¿Cuánto llevo ganado esta semana?"
- "Mostrar reparaciones pendientes"

## Próximos pasos
- Implementar Room, repositorios y UI de chat/dashboard
- Agregar reconocimiento de voz y TTS
- Automatización completa de envío por WhatsApp
