package com.tallerreparaciones.asistente.export

import android.content.Context
import android.net.Uri
import androidx.core.content.FileProvider
import com.itextpdf.text.Document
import com.itextpdf.text.Paragraph
import com.itextpdf.text.pdf.PdfWriter
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVPrinter
import java.io.File
import java.io.FileOutputStream

object ReportExporter {
    fun exportCsv(context: Context, rows: List<List<String>>, fileName: String = "reporte.csv"): Uri {
        val file = File(context.cacheDir, fileName)
        file.bufferedWriter().use { writer ->
            val csv = CSVPrinter(writer, CSVFormat.DEFAULT)
            rows.forEach { csv.printRecord(it) }
            csv.flush()
        }
        return FileProvider.getUriForFile(context, context.packageName + ".provider", file)
    }

    fun exportPdf(context: Context, paragraphs: List<String>, fileName: String = "reporte.pdf"): Uri {
        val file = File(context.cacheDir, fileName)
        val document = Document()
        PdfWriter.getInstance(document, FileOutputStream(file))
        document.open()
        paragraphs.forEach { document.add(Paragraph(it)) }
        document.close()
        return FileProvider.getUriForFile(context, context.packageName + ".provider", file)
    }
}
