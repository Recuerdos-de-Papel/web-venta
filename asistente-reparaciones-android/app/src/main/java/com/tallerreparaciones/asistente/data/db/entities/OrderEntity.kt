package com.tallerreparaciones.asistente.data.db.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "orders")
data class OrderEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "order_number") val orderNumber: String,
    @ColumnInfo(name = "machine_type") val machineType: String,
    @ColumnInfo(name = "client_name") val clientName: String,
    @ColumnInfo(name = "client_phone") val clientPhone: String?,
    @ColumnInfo(name = "client_address") val clientAddress: String?,
    @ColumnInfo(name = "problem_description") val problemDescription: String?,
    val diagnosis: String?,
    @ColumnInfo(name = "total_amount") val totalAmount: Double?,
    val status: String,
    @ColumnInfo(name = "created_date") val createdDate: Date = Date(),
    @ColumnInfo(name = "completed_date") val completedDate: Date?,
    @ColumnInfo(name = "paid_date") val paidDate: Date?
)