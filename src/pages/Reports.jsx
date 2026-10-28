import { useMemo, useState } from 'react'
import { Download, FileSpreadsheet, FileText, Filter, Users, WalletCards } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/seedData'
import { Button, Field, SelectField } from '../components/ui'
import { exportReportToExcel, exportReportToPdf } from '../utils/exportReports'
import reportLedger from '../assets/report-ledger.svg'

const financialRoles = [ROLES.TESORERO, ROLES.ADMINISTRADOR, ROLES.PASTOR]
const reportOptions = [
  { value: 'members', label: 'Reporte general de miembros' },
  { value: 'attendance', label: 'Reporte de asistencia por evento' },
  { value: 'ministries', label: 'Reporte de participación por ministerio' },
  { value: 'donations', label: 'Reporte de ingresos por periodo' },
]
const statusOptions = [{ value: 'TODOS', label: 'Todos' }, { value: 'ACTIVO', label: 'Activos' }, { value: 'INACTIVO', label: 'Inactivos' }]
const formatDate = (value) => value ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`)) : '—'
const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value) || 0)

export default function Reports() {
  const { currentUser, churchConfig, members, events, attendance, ministries, donations, users } = useApp()
  const canSeeFinances = financialRoles.includes(currentUser.role)
  const availableReports = reportOptions.filter((option) => option.value !== 'donations' || canSeeFinances)
  const [type, setType] = useState('members')
  const [filters, setFilters] = useState({ status: 'TODOS', from: '', to: '', eventId: '', ministryId: '', donationFrom: '', donationTo: '' })
  const selectedType = availableReports.some((option) => option.value === type) ? type : 'members'

  const memberRows = useMemo(() => members.filter((member) => (
    (filters.status === 'TODOS' || member.status === filters.status)
    && (!filters.from || member.joinDate >= filters.from)
    && (!filters.to || member.joinDate <= filters.to)
  )).map((member) => ({ name: member.fullName, phone: member.phone || '—', email: member.email || '—', joinDate: formatDate(member.joinDate), status: member.status === 'ACTIVO' ? 'Activo' : 'Inactivo' })), [members, filters])

  const attendanceRows = useMemo(() => attendance.filter((record) => (
    (!filters.eventId || record.eventId === filters.eventId)
    && (!filters.from || record.date >= filters.from)
    && (!filters.to || record.date <= filters.to)
  )).map((record) => {
    const event = events.find((item) => item.id === record.eventId)
    const present = record.records.filter((item) => item.status === 'PRESENTE').length
    const absent = record.records.filter((item) => item.status === 'AUSENTE').length
    return { event: event?.title || 'Evento archivado', date: formatDate(record.date), present, absent, percentage: `${record.records.length ? Math.round((present / record.records.length) * 100) : 0}%` }
  }), [attendance, events, filters])

  const ministryRows = useMemo(() => ministries.filter((ministry) => !filters.ministryId || ministry.id === filters.ministryId).map((ministry) => {
    const coordinator = users.find((user) => user.id === ministry.responsibleId)
    const names = ministry.memberIds.map((id) => members.find((member) => member.id === id)?.fullName).filter(Boolean)
    return { ministry: ministry.name, coordinator: coordinator?.name || 'Sin responsable', total: names.length, members: names.join(', ') || 'Sin integrantes' }
  }), [ministries, users, members, filters.ministryId])

  const donationRows = useMemo(() => donations.filter((donation) => (
    (!filters.donationFrom || donation.date >= filters.donationFrom)
    && (!filters.donationTo || donation.date <= filters.donationTo)
  )).sort((a, b) => b.date.localeCompare(a.date)).map((donation) => ({
    date: formatDate(donation.date),
    concept: donation.concept.replaceAll('_', ' '),
    method: donation.method,
    donor: donation.anonymous ? 'Anónimo' : members.find((member) => member.id === donation.memberId)?.fullName || 'Miembro no disponible',
    amount: money(donation.amount),
    amountValue: Number(donation.amount),
  })), [donations, members, filters.donationFrom, filters.donationTo])

  const report = {
    members: { title: 'Reporte general de miembros', columns: [{ key: 'name', label: 'Nombre' }, { key: 'phone', label: 'Teléfono' }, { key: 'email', label: 'Correo' }, { key: 'joinDate', label: 'Fecha de ingreso' }, { key: 'status', label: 'Estado' }], rows: memberRows, totals: [{ label: 'Total de miembros', value: memberRows.length }] },
    attendance: { title: 'Reporte de asistencia por evento', columns: [{ key: 'event', label: 'Evento' }, { key: 'date', label: 'Fecha' }, { key: 'present', label: 'Asistentes' }, { key: 'absent', label: 'Ausentes' }, { key: 'percentage', label: 'Porcentaje' }], rows: attendanceRows, totals: [{ label: 'Total de registros', value: attendanceRows.length }, { label: 'Total de asistentes', value: attendanceRows.reduce((sum, row) => sum + row.present, 0) }] },
    ministries: { title: 'Reporte de participación por ministerio', columns: [{ key: 'ministry', label: 'Ministerio' }, { key: 'coordinator', label: 'Coordinador' }, { key: 'total', label: 'Integrantes' }, { key: 'members', label: 'Miembros asignados' }], rows: ministryRows, totals: [{ label: 'Total de ministerios', value: ministryRows.length }, { label: 'Integrantes vinculados', value: ministryRows.reduce((sum, row) => sum + row.total, 0) }] },
    donations: { title: 'Reporte de ingresos por periodo', columns: [{ key: 'date', label: 'Fecha' }, { key: 'concept', label: 'Concepto' }, { key: 'method', label: 'Método' }, { key: 'donor', label: 'Aportador' }, { key: 'amount', label: 'Monto' }], rows: donationRows, totals: [{ label: 'Total recaudado', value: money(donationRows.reduce((sum, row) => sum + row.amountValue, 0)) }, { label: 'Total de aportaciones', value: donationRows.length }] },
  }[selectedType]

  const exportReport = (format) => {
    const options = { ...report, churchConfig }
    if (format === 'pdf') exportReportToPdf(options)
    else exportReportToExcel(options)
  }

  return <div className="mx-auto max-w-7xl">
    <section className="relative mb-8 min-h-[225px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"><img src={reportLedger} alt="Libro de reportes y registros de la iglesia" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" /><div className="relative flex min-h-[225px] max-w-xl flex-col justify-center p-6 sm:p-10"><p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-indigo-600">Análisis y cuidado</p><h1 className="text-4xl leading-tight text-slate-900">Reportes</h1><p className="mt-3 text-sm leading-7 text-slate-500">Convierte los registros de la iglesia en decisiones claras y responsables.</p></div></section>
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"><SelectField label="Reporte oficial" options={availableReports} value={selectedType} onChange={(event) => setType(event.target.value)} /><div className="flex items-center gap-2 text-sm text-slate-500"><Filter size={17} />{report.rows.length} registros</div></div>{selectedType === 'members' && <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3"><SelectField label="Estado" options={statusOptions} value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} /><Field label="Ingreso desde" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /><Field label="Ingreso hasta" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></div>}{selectedType === 'attendance' && <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3"><SelectField label="Evento" options={[{ value: '', label: 'Todos los eventos' }, ...events.map((event) => ({ value: event.id, label: event.title }))]} value={filters.eventId} onChange={(event) => setFilters({ ...filters, eventId: event.target.value })} /><Field label="Fecha desde" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /><Field label="Fecha hasta" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></div>}{selectedType === 'ministries' && <div className="mt-5 border-t border-slate-100 pt-5 md:max-w-md"><SelectField label="Ministerio" options={[{ value: '', label: 'Todos los ministerios' }, ...ministries.map((ministry) => ({ value: ministry.id, label: ministry.name }))]} value={filters.ministryId} onChange={(event) => setFilters({ ...filters, ministryId: event.target.value })} /></div>}{selectedType === 'donations' && <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2"><Field label="Fecha de inicio" type="date" value={filters.donationFrom} onChange={(event) => setFilters({ ...filters, donationFrom: event.target.value })} /><Field label="Fecha fin" type="date" value={filters.donationTo} onChange={(event) => setFilters({ ...filters, donationTo: event.target.value })} /></div>}</div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"><div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold text-slate-900">{report.title}</h2><p className="mt-1 text-sm text-slate-500">Previsualización de datos exportables.</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => exportReport('pdf')}><FileText size={16} />Exportar a PDF</Button><Button onClick={() => exportReport('xlsx')}><FileSpreadsheet size={16} />Exportar a Excel</Button></div></div><ReportTable type={selectedType} columns={report.columns} rows={report.rows} /><div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 sm:flex-row sm:justify-end sm:gap-6">{report.totals.map((total) => <span key={total.label}>{total.label}: {total.value}</span>)}</div></section>
  </div>
}

function ReportTable({ type, columns, rows }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{columns.map((column) => <th key={column.key} className="px-5 py-4 font-semibold">{column.label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr key={`${row[columns[0].key]}-${index}`} className="hover:bg-slate-50/70">{columns.map((column) => <td key={column.key} className={`px-5 py-4 ${column.key === 'amount' || column.key === 'percentage' ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{type === 'ministries' && column.key === 'members' ? <span className="block max-w-md whitespace-normal leading-5">{row[column.key]}</span> : row[column.key]}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <div className="px-5 py-12 text-center text-sm text-slate-500">No hay datos para los filtros seleccionados.</div>}</div>
}
