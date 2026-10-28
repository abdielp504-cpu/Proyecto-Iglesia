import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

function generationDate() {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())
}

function safeFileName(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()
}

function institutionLines(churchConfig) {
  return [
    churchConfig.name || 'Iglesia',
    churchConfig.address || 'Sin dirección registrada',
    [churchConfig.phone, churchConfig.email].filter(Boolean).join(' · ') || 'Sin datos de contacto',
  ]
}

export function exportReportToPdf({ title, columns, rows, totals = [], churchConfig }) {
  const document = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' })
  const [name, address, contact] = institutionLines(churchConfig)
  document.setFontSize(16)
  document.setTextColor(30, 27, 75)
  document.text(name, 14, 16)
  document.setFontSize(9)
  document.setTextColor(71, 85, 105)
  document.text(address, 14, 22)
  document.text(contact, 14, 27)
  document.setFontSize(13)
  document.setTextColor(15, 23, 42)
  document.text(title, 14, 38)
  document.setFontSize(8)
  document.setTextColor(100, 116, 139)
  document.text(`Generado: ${generationDate()}`, 14, 44)
  autoTable(document, {
    startY: 50,
    head: [columns.map((column) => column.label)],
    body: rows.map((row) => columns.map((column) => row[column.key] ?? '')),
    styles: { fontSize: columns.length > 6 ? 7 : 8, cellPadding: 2.5 },
    headStyles: { fillColor: [49, 46, 129], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })
  if (totals.length > 0) {
    const finalY = (document.lastAutoTable?.finalY || 50) + 10
    document.setFontSize(9)
    document.setTextColor(15, 23, 42)
    totals.forEach((total, index) => document.text(`${total.label}: ${total.value}`, 14, finalY + (index * 5)))
  }
  document.save(`${safeFileName(title)}.pdf`)
}

export function exportReportToExcel({ title, columns, rows, totals = [] }) {
  const worksheetRows = [
    columns.map((column) => column.label),
    ...rows.map((row) => columns.map((column) => row[column.key] ?? '')),
  ]
  if (totals.length > 0) {
    worksheetRows.push([])
    totals.forEach((total) => worksheetRows.push([total.label, total.value]))
  }
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows)
  worksheet['!cols'] = columns.map((column) => ({ wch: Math.max(column.label.length + 2, 16) }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
  XLSX.writeFile(workbook, `${safeFileName(title)}.xlsx`)
}
