package com.tallerreparaciones.asistente.data.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import androidx.room.Delete
import com.tallerreparaciones.asistente.data.db.entities.OrderEntity
import kotlinx.coroutines.flow.Flow
import java.util.Date

@Dao
interface OrderDao {
    @Insert
    suspend fun insert(order: OrderEntity): Long

    @Update
    suspend fun update(order: OrderEntity)

    @Delete
    suspend fun delete(order: OrderEntity)

    @Query("SELECT * FROM orders ORDER BY created_date DESC")
    fun observeAll(): Flow<List<OrderEntity>>

    @Query("SELECT * FROM orders WHERE status = :status ORDER BY created_date DESC")
    fun observeByStatus(status: String): Flow<List<OrderEntity>>

    @Query("SELECT * FROM orders WHERE status = :status ORDER BY created_date DESC")
    suspend fun getByStatus(status: String): List<OrderEntity>

    @Query("SELECT * FROM orders WHERE id = :id")
    fun observeById(id: Long): Flow<OrderEntity?>

    @Query("UPDATE orders SET status = :status, completed_date = CASE WHEN :status = 'completada' THEN :date ELSE completed_date END, paid_date = CASE WHEN :status = 'cobrada' THEN :date ELSE paid_date END WHERE order_number = :orderNumber")
    suspend fun updateStatusByOrderNumber(orderNumber: String, status: String, date: Date?)

    @Query("SELECT SUM(total_amount) FROM orders WHERE paid_date BETWEEN :from AND :to")
    suspend fun sumPaidBetween(from: Date, to: Date): Double?

    @Query("SELECT * FROM orders WHERE order_number = :orderNumber LIMIT 1")
    suspend fun getByOrderNumber(orderNumber: String): OrderEntity?

    @Query("SELECT * FROM orders ORDER BY created_date DESC LIMIT 1")
    suspend fun getLatest(): OrderEntity?
}
