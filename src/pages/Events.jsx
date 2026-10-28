import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Edit3, MapPin, Plus, Tag, UserRound, XCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/seedData'
import { Alert, Button, Field, Modal, SelectField, TextArea } from '../components/ui'
import worshipInterior from '../assets/worship-interior.svg'

const editorRoles = [ROLES.ADMINISTRADOR, ROLES.PASTOR, ROLES.SECRETARIO, ROLES.COORDINADOR]
const eventTypes = [{ value: 'RELIGIOSO', label: 'Religioso' }, { value: 'ADMINISTRATIVO', label: 'Administrativo' }]
const eventStatuses = [{ value: 'PROGRAMADO', label: 'Programado' }, { value: 'MODIFICADO', label: 'Modificado' }, { value: 'CANCELADO', label: 'Cancelado' }]
const emptyEvent = { title: '', type: 'RELIGIOSO', date: '', time: '', location: '', description: '', responsibleId: '', ministryId: '', status: 'PROGRAMADO' }

function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

function monthLabel(date) {
  return new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(date)
}

function calendarDays(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = []
  for (let index = 0; index < offset; index += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), day))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function statusStyle(status) {
  if (status === 'CANCELADO') return 'bg-rose-100 text-rose-700'
  if (status === 'MODIFICADO') return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

export default function Events() {
  const { events, members, users, ministries, currentUser, addEvent, updateEvent } = useApp()
  const canEdit = editorRoles.includes(currentUser.role)
  const responsibleOptions = [...users.filter((user) => user.role === ROLES.COORDINADOR && user.active).map((user) => ({ value: user.id, label: `${user.name} (Coordinador)` })), ...members.filter((member) => member.status === 'ACTIVO').map((member) => ({ value: member.id, label: `${member.fullName} (Miembro)` }))]
  const [tab, setTab] = useState('calendar')
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [detail, setDetail] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyEvent)
  const [error, setError] = useState('')
  const [listFilters, setListFilters] = useState({ date: '', type: 'TODOS' })

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyEvent, date: selectedDate || dateKey(new Date()) })
    setError('')
    setFormOpen(true)
  }
  const openEdit = (event) => {
    setEditingId(event.id)
    setForm({ ...emptyEvent, ...event })
    setError('')
    setFormOpen(true)
    setDetail(null)
  }
  const submit = (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.date || !form.time || !form.location.trim()) return setError('Título, fecha, hora y lugar son obligatorios.')
    const changes = { ...form, title: form.title.trim(), location: form.location.trim() }
    if (editingId) updateEvent(editingId, changes)
    else addEvent(changes)
    setFormOpen(false)
  }
  const eventsForDate = selectedDate ? events.filter((event) => event.date === selectedDate) : []
  const filteredEvents = useMemo(() => events.filter((event) => (!listFilters.date || event.date === listFilters.date) && (listFilters.type === 'TODOS' || event.type === listFilters.type)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [events, listFilters])
  const calendar = calendarDays(month)

  return <div className="mx-auto max-w-7xl">
    <section className="relative mb-8 min-h-[225px] overflow-hidden rounded-2xl bg-slate-950 text-white shadow-soft"><img src={worshipInterior} alt="Interior del templo preparado para una reunión" className="absolute inset-0 h-full w-full object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/45 to-transparent" /><div className="relative flex min-h-[225px] max-w-xl flex-col justify-center p-6 sm:p-10"><p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-cyan-200">Agenda de la comunidad</p><h1 className="text-4xl leading-tight text-white">Eventos</h1><p className="mt-3 text-sm leading-7 text-slate-200">Cultos, reuniones y actividades para encontrarnos, aprender y servir juntos.</p>{canEdit && <Button className="mt-5 w-fit" onClick={openCreate}><Plus size={18} />Nuevo evento</Button>}</div></section>
    <div className="mb-5 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-soft"><button className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'calendar' ? 'bg-indigo-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setTab('calendar')}><CalendarDays className="mr-2 inline" size={16} />Calendario mensual</button><button className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'list' ? 'bg-indigo-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setTab('list')}>Lista de eventos</button></div>
    {tab === 'calendar' ? <div className="grid gap-5 xl:grid-cols-[1fr_320px]"><section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6"><div className="mb-5 flex items-center justify-between"><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Mes anterior"><ChevronLeft size={20} /></button><h2 className="text-lg font-bold capitalize text-slate-900">{monthLabel(month)}</h2><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Mes siguiente"><ChevronRight size={20} /></button></div><div className="grid grid-cols-7 border-b border-l border-slate-200">{['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => <div key={day} className="border-r border-t border-slate-200 bg-slate-50 p-2 text-center text-xs font-bold text-slate-500">{day}</div>)}{calendar.map((day, index) => { const key = day && dateKey(day); const dayEvents = events.filter((event) => event.date === key); return <button key={`${key || 'empty'}-${index}`} disabled={!day} onClick={() => day && setSelectedDate(key)} className={`min-h-24 border-r border-t border-slate-200 p-2 text-left align-top transition ${day ? 'hover:bg-indigo-50' : 'cursor-default bg-slate-50/50'} ${selectedDate === key ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500' : ''}`}><span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${key === dateKey(new Date()) ? 'bg-indigo-700 font-bold text-white' : 'text-slate-700'}`}>{day?.getDate()}</span><div className="mt-1 space-y-1">{dayEvents.slice(0, 2).map((event) => <span key={event.id} className={`block truncate rounded px-1.5 py-1 text-[10px] font-semibold ${event.status === 'CANCELADO' ? 'bg-rose-100 text-rose-700 line-through' : event.type === 'RELIGIOSO' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>{event.time} {event.title}</span>)}{dayEvents.length > 2 && <span className="block text-[10px] text-slate-500">+{dayEvents.length - 2} más</span>}</div></button> })}</div></section><aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-slate-900">{selectedDate ? formatDate(selectedDate) : 'Selecciona un día'}</h2>{selectedDate && <button className="text-slate-400 hover:text-slate-700" onClick={() => setSelectedDate(null)} aria-label="Limpiar fecha"><XCircle size={18} /></button>}</div>{!selectedDate ? <p className="text-sm leading-6 text-slate-500">Haz clic en un día del calendario para consultar sus eventos.</p> : eventsForDate.length === 0 ? <p className="text-sm text-slate-500">No hay eventos programados para esta fecha.</p> : <div className="space-y-3">{eventsForDate.map((event) => <EventSummary key={event.id} event={event} onClick={() => setDetail(event.id)} />)}</div>}{canEdit && selectedDate && <Button className="mt-5 w-full" variant="secondary" onClick={openCreate}><Plus size={16} />Crear en esta fecha</Button>}</aside></div> : <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]"><Field label="Filtrar por fecha" type="date" value={listFilters.date} onChange={(event) => setListFilters({ ...listFilters, date: event.target.value })} /><SelectField label="Tipo de evento" options={[{ value: 'TODOS', label: 'Todos los tipos' }, ...eventTypes]} value={listFilters.type} onChange={(event) => setListFilters({ ...listFilters, type: event.target.value })} /></div><div className="grid gap-4 md:grid-cols-2">{filteredEvents.map((event) => <EventCard key={event.id} event={event} onClick={() => setDetail(event.id)} />)}</div>{filteredEvents.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No hay eventos para los filtros seleccionados.</p>}</div>}
    {detail && <EventDetail event={events.find((event) => event.id === detail)} users={users} members={members} ministries={ministries} canEdit={canEdit} onClose={() => setDetail(null)} onEdit={openEdit} onCancel={(id) => updateEvent(id, { status: 'CANCELADO' })} />}
    {formOpen && <Modal title={editingId ? 'Editar evento' : 'Crear evento'} onClose={() => setFormOpen(false)}>{error && <div className="mb-4"><Alert>{error}</Alert></div>}<form className="space-y-4" onSubmit={submit}><Field label="Título" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><div className="grid gap-4 sm:grid-cols-2"><SelectField label="Tipo" options={eventTypes} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} /><SelectField label="Estado" options={eventStatuses} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} /><Field label="Fecha" type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /><Field label="Hora" type="time" required value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></div><Field label="Lugar" required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /><div className="grid gap-4 sm:grid-cols-2"><SelectField label="Responsable" options={[{ value: '', label: 'Sin asignar' }, ...responsibleOptions]} value={form.responsibleId} onChange={(event) => setForm({ ...form, responsibleId: event.target.value })} /><SelectField label="Ministerio (opcional)" options={[{ value: '', label: 'Ninguno' }, ...ministries.map((ministry) => ({ value: ministry.id, label: ministry.name }))]} value={form.ministryId} onChange={(event) => setForm({ ...form, ministryId: event.target.value })} /></div><TextArea label="Descripción" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><div className="flex justify-end gap-3 pt-3"><Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancelar</Button><Button type="submit">{editingId ? 'Guardar cambios' : 'Crear evento'}</Button></div></form></Modal>}
  </div>
}

function EventSummary({ event, onClick }) {
  return <button className="w-full rounded-xl border border-slate-200 p-3 text-left hover:border-indigo-300 hover:bg-indigo-50" onClick={onClick}><div className="flex items-start justify-between gap-2"><p className="font-semibold text-slate-900">{event.title}</p><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusStyle(event.status || 'PROGRAMADO')}`}>{event.status || 'PROGRAMADO'}</span></div><p className="mt-2 text-xs text-slate-500">{event.time} · {event.location}</p></button>
}

function EventCard({ event, onClick }) {
  return <button onClick={onClick} className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-indigo-300 hover:shadow-md"><div className="mb-3 flex items-start justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-wide text-indigo-600">{event.type === 'RELIGIOSO' ? 'Religioso' : 'Administrativo'}</span><h2 className={`mt-1 text-lg font-bold ${event.status === 'CANCELADO' ? 'text-rose-700 line-through' : 'text-slate-900'}`}>{event.title}</h2></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(event.status || 'PROGRAMADO')}`}>{event.status || 'PROGRAMADO'}</span></div><div className="space-y-2 text-sm text-slate-500"><p className="flex gap-2"><CalendarDays size={16} />{formatDate(event.date)}</p><p className="flex gap-2"><Clock3 size={16} />{event.time}</p><p className="flex gap-2"><MapPin size={16} />{event.location}</p></div></button>
}

function EventDetail({ event, users, members, ministries, canEdit, onClose, onEdit, onCancel }) {
  if (!event) return null
  const responsible = users.find((user) => user.id === event.responsibleId)?.name || members.find((member) => member.id === event.responsibleId)?.fullName
  const ministry = ministries.find((item) => item.id === event.ministryId)?.name
  return <Modal title="Detalle del evento" onClose={onClose}><div className="space-y-4"><div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle(event.status || 'PROGRAMADO')}`}>{event.status || 'PROGRAMADO'}</span><h2 className={`mt-3 text-2xl font-bold ${event.status === 'CANCELADO' ? 'text-rose-700 line-through' : 'text-slate-900'}`}>{event.title}</h2></div><div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2"><p className="flex gap-2"><CalendarDays size={17} className="text-indigo-600" />{formatDate(event.date)}</p><p className="flex gap-2"><Clock3 size={17} className="text-indigo-600" />{event.time}</p><p className="flex gap-2"><MapPin size={17} className="text-indigo-600" />{event.location}</p><p className="flex gap-2"><Tag size={17} className="text-indigo-600" />{ministry || 'Sin ministerio'}</p><p className="flex gap-2 sm:col-span-2"><UserRound size={17} className="text-indigo-600" />{responsible || 'Sin responsable'}</p></div><p className="whitespace-pre-line text-sm leading-6 text-slate-600">{event.description || 'Sin descripción.'}</p>{canEdit && <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4"><Button variant="secondary" onClick={() => onEdit(event)}><Edit3 size={16} />Editar</Button>{event.status !== 'CANCELADO' && <Button variant="danger" onClick={() => { onCancel(event.id); onClose() }}><XCircle size={16} />Cancelar evento</Button>}</div>}</div></Modal>
}
