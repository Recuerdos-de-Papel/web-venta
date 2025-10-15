package com.tallerreparaciones.asistente.data.db

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.tallerreparaciones.asistente.data.db.dao.OrderDao
import com.tallerreparaciones.asistente.data.db.dao.PaymentDao
import com.tallerreparaciones.asistente.data.db.dao.SparePartDao
import com.tallerreparaciones.asistente.data.db.entities.OrderEntity
import com.tallerreparaciones.asistente.data.db.entities.PaymentEntity
import com.tallerreparaciones.asistente.data.db.entities.SparePartEntity

@Database(
    entities = [OrderEntity::class, SparePartEntity::class, PaymentEntity::class],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun orderDao(): OrderDao
    abstract fun sparePartDao(): SparePartDao
    abstract fun paymentDao(): PaymentDao
}
