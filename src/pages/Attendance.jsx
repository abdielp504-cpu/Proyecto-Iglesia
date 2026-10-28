import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck2, Check, CheckCheck, ClipboardCheck, Search, Users, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Alert, Button, SelectField } from '../components/ui'
import attendanceCircle from '../assets/attendance-circle.svg'

const today = () => new Date().toISOString().slice(0, 10)

function formatDate(value) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

function dateDifference(from, to) {
  return Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000)
}

function metric(records, days, endDate) {
  const relevant = records.filter((record) => {
    const difference = dateDifference(record.date, endDate)
    return difference >= 0 && difference < days
  })
  const total = relevant.reduce((sum, record) => sum + record.records.length, 0)
  const present = relevant.reduce((sum, record) => sum + record.records.filter((item) => item.status === 'PRESENTE').length, 0)
  return { sessions: relevant.length, total, present, percentage: total ? Math.round((present / total) * 100) : 0 }
}

export default function Attendance() {
  const { members, events, attendance, saveAttendance } = useApp()
  const activeMembers = members.filter((member) => member.status === 'ACTIVO')
  const availableDates = [...new Set(events.map((event) => event.date))].sort()
  const [tab, setTab] = useState('register')
  const [date, setDate] = useState(availableDates[0] || today())
  const [eventId, setEventId] = useState('')
  const [search, setSearch] = useState('')
  const [records, setRecords] = useState([])
  const [saved, setSaved] = useState(false)

  const eventsForDate = useMemo(() => events.filter((event) => event.date === date && event.status !== 'CANCELADO'), [events, date])
  const selectedEvent = events.find((event) => event.id === eventId)
  const filteredMembers = activeMembers.filter((member) => member.fullName.toLowerCase().includes(search.trim().toLowerCase()))
  const selectedDateAttendance = attendance.find((record) => record.eventId === eventId && record.date === date)

  useEffect(() => {
    if (!eventsForDate.some((event) => event.id === eventId)) setEventId(eventsForDate[0]?.id || '')
  }, [date, eventsForDate, eventId])

  useEffect(() => {
    const existing = attendance.find((record) => record.eventId === eventId && record.date === date)
    setRecords(existing?.records || activeMembers.map((member) => ({ memberId: member.id, status: 'AUSENTE' })))
    setSaved(false)
  }, [activeMembers, attendance, date, eventId])

  const setStatus = (memberId, status) => {
    setSaved(false)
    setRecords((previous) => previous.map((record) => (record.memberId === memberId ? { ...record, status } : record)))
  }
  const markAll = (status) => {
    setSaved(false)
    setRecords(activeMembers.map((member) => ({ memberId: member.id, status })))
  }
  const save = () => {
    if (!eventId) return
    saveAttendance(eventId, date, records)
    setSaved(true)
  }
  const weekly = metric(attendance, 7, date)
  const monthly = metric(attendance, 30, date)
  const history = [...attendance].sort((a, b) => b.date.localeCompare(a.date))

  return <div className="mx-auto max-w-6xl">
    <section className="relative mb-8 min-h-[225px] overflow-hidden rounded-2xl bg-slate-950 text-white shadow-soft"><img src={attendanceCircle} alt="Comunidad reunida en un círculo de oración" className="absolute inset-0 h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/45 to-transparent" /><div className="relative flex min-h-[225px] max-w-xl flex-col justify-center p-6 sm:p-10"><p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-cyan-200">Presencia y participación</p><h1 className="text-4xl leading-tight text-white">Asistencia</h1><p className="mt-3 text-sm leading-7 text-slate-200">Registra la participación para acompañar mejor a cada miembro de la comunidad.</p></div></section>
    <div className="mb-5 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-soft"><button className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'register' ? 'bg-indigo-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setTab('register')}><ClipboardCheck className="mr-2 inline" size={16} />Registrar asistencia</button><button className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'history' ? 'bg-indigo-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setTab('history')}><CalendarCheck2 className="mr-2 inline" size={16} />Historial</button></div>
    {tab === 'register' ? <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><div className="grid gap-4 border-b border-slate-100 pb-5 md:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Fecha</span><input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={date} onChange={(event) => setDate(event.target.value)} /></label><SelectField label="Evento correspondiente" options={[{ value: '', label: eventsForDate.length ? 'Selecciona un evento' : 'No hay eventos en esta fecha' }, ...eventsForDate.map((event) => ({ value: event.id, label: `${event.time} · ${event.title}` }))]} value={eventId} onChange={(event) => setEventId(event.target.value)} /></div>{selectedEvent ? <><div className="flex flex-col justify-between gap-4 border-b border-slate-100 py-5 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold text-slate-900">{selectedEvent.title}</h2><p className="mt-1 text-sm text-slate-500">{formatDate(date)} · {selectedEvent.location}</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => markAll('PRESENTE')}><CheckCheck size={16} />Todos presentes</Button><Button variant="ghost" onClick={() => markAll('AUSENTE')}><X size={16} />Todos ausentes</Button></div></div><div className="my-5"><label className="relative block"><Search className="absolute left-3 top-2.5 text-slate-400" size={18} /><input className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="Buscar miembro..." value={search} onChange={(event) => setSearch(event.target.value)} /></label></div><div className="overflow-hidden rounded-xl border border-slate-200"><div className="divide-y divide-slate-100">{filteredMembers.map((member) => { const record = records.find((item) => item.memberId === member.id); const present = record?.status === 'PRESENTE'; return <div key={member.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{member.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><span className="text-sm font-semibold text-slate-800">{member.fullName}</span></div><div className="flex rounded-lg bg-slate-100 p-1"><button className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold transition ${present ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-700'}`} onClick={() => setStatus(member.id, 'PRESENTE')}><Check size={14} />Presente</button><button className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold transition ${!present ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-rose-700'}`} onClick={() => setStatus(member.id, 'AUSENTE')}><X size={14} />Ausente</button></div></div> })}</div>{filteredMembers.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No hay miembros que coincidan con la búsqueda.</p>}</div><div className="mt-5 flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">{saved && <Alert type="success">Asistencia guardada correctamente.</Alert>}<Button onClick={save} disabled={!eventId}><ClipboardCheck size={17} />Guardar asistencia</Button></div></> : <div className="rounded-xl bg-slate-50 p-8 text-center"><CalendarCheck2 className="mx-auto mb-3 text-slate-400" size={32} /><p className="text-sm text-slate-500">Selecciona una fecha con un evento para comenzar el registro.</p></div>}</section> : <History attendance={history} events={events} weekly={weekly} monthly={monthly} selectedDate={date} selectedDateAttendance={selectedDateAttendance} />}
  </div>
}

function History({ attendance, events, weekly, monthly, selectedDate, selectedDateAttendance }) {
  return <div><div className="mb-5 grid gap-4 md:grid-cols-2"><MetricCard title="Resumen semanal" metric={weekly} /><MetricCard title="Resumen mensual" metric={monthly} /></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold text-slate-900">Listas guardadas</h2><p className="mt-1 text-sm text-slate-500">Registros históricos de asistencia.</p></div><span className="text-sm text-slate-500">{attendance.length} registros</span></div>{attendance.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">Aún no hay registros guardados.</p> : <div className="space-y-3">{attendance.map((record) => { const event = events.find((item) => item.id === record.eventId); const present = record.records.filter((item) => item.status === 'PRESENTE').length; const total = record.records.length; return <div key={record.id} className={`flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${record.date === selectedDate ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200'}`}><div><h3 className="font-semibold text-slate-900">{event?.title || 'Evento archivado'}</h3><p className="mt-1 text-xs text-slate-500">{formatDate(record.date)} · {event?.location || 'Sin lugar'}</p></div><div className="flex items-center gap-4"><div className="text-right"><p className="text-lg font-bold text-slate-900">{present}/{total}</p><p className="text-xs text-slate-500">presentes</p></div><div className="h-2 w-24 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${total ? (present / total) * 100 : 0}%` }} /></div></div></div> })}</div>}</div></div>
}

function MetricCard({ title, metric: summary }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold text-slate-900">{summary.percentage}%</p><p className="mt-1 text-sm text-slate-500">porcentaje de asistencia</p></div><div className="rounded-xl bg-indigo-100 p-3 text-indigo-700"><Users size={22} /></div></div><div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center"><div><p className="font-bold text-slate-900">{summary.present}</p><p className="text-xs text-slate-500">asistentes</p></div><div><p className="font-bold text-slate-900">{summary.total ? Math.round(summary.present / summary.sessions) : 0}</p><p className="text-xs text-slate-500">promedio</p></div><div><p className="font-bold text-slate-900">{summary.sessions}</p><p className="text-xs text-slate-500">sesiones</p></div></div></div>
}
