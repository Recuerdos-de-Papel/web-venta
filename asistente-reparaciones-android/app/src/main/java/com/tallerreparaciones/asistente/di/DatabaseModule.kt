package com.tallerreparaciones.asistente.di

import android.content.Context
import androidx.room.Room
import com.tallerreparaciones.asistente.data.db.AppDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "asistente_reparaciones.db"
        ).fallbackToDestructiveMigration()
            .build()

    @Provides
    fun provideOrderDao(db: AppDatabase) = db.orderDao()

    @Provides
    fun provideSparePartDao(db: AppDatabase) = db.sparePartDao()

    @Provides
    fun providePaymentDao(db: AppDatabase) = db.paymentDao()
}
