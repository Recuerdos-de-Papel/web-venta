# Mantener clases de Hilt/DI
-keep class dagger.hilt.** { *; }
-keep class * extends android.app.Service { *; }
-keep class * extends android.app.Activity { *; }
-keep class * extends android.app.Application { *; }
-keep class androidx.room.** { *; }
-dontwarn javax.annotation.**
-dontwarn dagger.hilt.internal.**
