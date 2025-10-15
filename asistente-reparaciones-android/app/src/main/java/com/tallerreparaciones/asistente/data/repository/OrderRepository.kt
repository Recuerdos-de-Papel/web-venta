package com.tallerreparaciones.asistente.data.repository

import com.tallerreparaciones.asistente.data.db.dao.OrderDao
import com.tallerreparaciones.asistente.data.db.dao.PaymentDao
import com.tallerreparaciones.asistente.data.db.dao.SparePartDao
import com.tallerreparaciones.asistente.data.db.entities.OrderEntity
import com.tallerreparaciones.asistente.data.db.entities.PaymentEntity
import com.tallerreparaciones.asistente.data.db.entities.SparePartEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.util.Date
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrderRepository @Inject constructor(
    private val orderDao: OrderDao,
    private val partDao: SparePartDao,
    private val paymentDao: PaymentDao
) {
    fun observeAll(): Flow<List<OrderEntity>> = orderDao.observeAll()
    fun observeByStatus(status: String): Flow<List<OrderEntity>> = orderDao.observeByStatus(status)
    fun observeById(id: Long) = orderDao.observeById(id)

    suspend fun createOrder(order: OrderEntity, parts: List<SparePartEntity>): Long = withContext(Dispatchers.IO) {
        val id = orderDao.insert(order)
        parts.forEach { partDao.insert(it.copy(orderId = id)) }
        id
    }

    suspend fun addPart(part: SparePartEntity) = withContext(Dispatchers.IO) { partDao.insert(part) }

    suspend fun addPayment(payment: PaymentEntity) = withContext(Dispatchers.IO) { paymentDao.insert(payment) }

    suspend fun updateStatusByOrderNumber(orderNumber: String, status: String, date: Date?) =
        withContext(Dispatchers.IO) { orderDao.updateStatusByOrderNumber(orderNumber, status, date) }

    suspend fun sumPaidBetween(from: Date, to: Date): Double = withContext(Dispatchers.IO) {
        orderDao.sumPaidBetween(from, to) ?: 0.0
    }

    suspend fun getByOrderNumber(orderNumber: String): OrderEntity? = withContext(Dispatchers.IO) {
        orderDao.getByOrderNumber(orderNumber)
    }

    suspend fun getPending(): List<OrderEntity> = withContext(Dispatchers.IO) { orderDao.getByStatus("pendiente") }
}
