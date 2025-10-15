package com.tallerreparaciones.asistente.data.db.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import com.tallerreparaciones.asistente.data.db.entities.SparePartEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SparePartDao {
    @Insert
    suspend fun insert(part: SparePartEntity): Long

    @Update
    suspend fun update(part: SparePartEntity)

    @Delete
    suspend fun delete(part: SparePartEntity)

    @Query("SELECT * FROM spare_parts WHERE order_id = :orderId")
    fun observeByOrder(orderId: Long): Flow<List<SparePartEntity>>

    @Query("DELETE FROM spare_parts WHERE order_id = :orderId")
    suspend fun deleteByOrder(orderId: Long)
}
