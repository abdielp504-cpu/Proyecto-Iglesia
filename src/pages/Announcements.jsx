import { useMemo, useState } from 'react'
import { CalendarDays, Edit3, Megaphone, Plus, Star, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/seedData'
import { Alert, Button, Field, Modal, SelectField, TextArea } from '../components/ui'

const canManageRoles = [ROLES.ADMINISTRADOR, ROLES.PASTOR, ROLES.SECRETARIO, ROLES.COORDINADOR]
const importanceOptions = [{ value: 'GENERAL', label: 'General' }, { value: 'IMPORTANTE', label: 'Importante' }]
const emptyAnnouncement = { title: '', content: '', publishedAt: new Date().toISOString().slice(0, 10), importance: 'GENERAL' }

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export default function Announcements() {
  const { announcements, events, currentUser, addAnnouncement, updateAnnouncement, removeAnnouncement } = useApp()
  const canManage = canManageRoles.includes(currentUser.role)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyAnnouncement)
  const [error, setError] = useState('')
  const important = announcements.filter((announcement) => announcement.importance === 'IMPORTANTE').sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  const upcoming = useMemo(() => events.filter((event) => event.status !== 'CANCELADO' && event.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 5), [events])
  const posts = [...announcements].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  const openCreate = () => { setEditingId(null); setForm({ ...emptyAnnouncement, publishedAt: new Date().toISOString().slice(0, 10) }); setError(''); setModalOpen(true) }
  const openEdit = (announcement) => { setEditingId(announcement.id); setForm({ ...announcement }); setError(''); setModalOpen(true) }
  const submit = (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.content.trim() || !form.publishedAt) return setError('Título, contenido y fecha de publicación son obligatorios.')
    const changes = { ...form, title: form.title.trim(), content: form.content.trim() }
    if (editingId) updateAnnouncement(editingId, changes)
    else addAnnouncement(changes)
    setModalOpen(false)
  }

  return <div className="mx-auto max-w-7xl">
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-indigo-600">Comunicación</p><h1 className="text-3xl font-bold text-slate-900">Comunicados y anuncios</h1><p className="mt-2 text-slate-500">Comparte información importante con la comunidad.</p></div>{canManage && <Button onClick={openCreate}><Plus size={18} />Publicar comunicado</Button>}</div>
    <div className="grid gap-6 xl:grid-cols-[1fr_330px]"><main><div className="grid gap-4 md:grid-cols-2">{posts.map((announcement) => <article key={announcement.id} className={`rounded-2xl border bg-white p-5 shadow-soft ${announcement.importance === 'IMPORTANTE' ? 'border-amber-200' : 'border-slate-200'}`}><div className="mb-4 flex items-start justify-between gap-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${announcement.importance === 'IMPORTANTE' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{announcement.importance === 'IMPORTANTE' && <Star size={13} />}{announcement.importance === 'IMPORTANTE' ? 'Importante' : 'General'}</span>{canManage && <div className="flex gap-1"><button className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" onClick={() => openEdit(announcement)} aria-label={`Editar ${announcement.title}`}><Edit3 size={16} /></button><button className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => removeAnnouncement(announcement.id)} aria-label={`Eliminar ${announcement.title}`}><Trash2 size={16} /></button></div>}</div><h2 className="text-lg font-bold text-slate-900">{announcement.title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{announcement.content}</p><p className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-400">Publicado el {formatDate(announcement.publishedAt)}</p></article>)}</div>{posts.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Megaphone className="mx-auto mb-3 text-slate-400" size={32} /><p className="text-sm text-slate-500">Aún no hay comunicados publicados.</p></div>}</main><aside className="space-y-5"><section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="mb-4 flex items-center gap-2"><Star className="text-amber-600" size={19} /><h2 className="font-bold text-amber-900">Avisos importantes</h2></div>{important.length === 0 ? <p className="text-sm text-amber-800/70">No hay avisos importantes.</p> : <div className="space-y-3">{important.map((announcement) => <div key={announcement.id} className="rounded-xl bg-white/70 p-3"><p className="text-sm font-bold text-amber-950">{announcement.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-amber-900/70">{announcement.content}</p></div>)}</div>}</section><section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5"><div className="mb-4 flex items-center gap-2"><CalendarDays className="text-indigo-700" size={19} /><h2 className="font-bold text-indigo-950">Próximos eventos</h2></div>{upcoming.length === 0 ? <p className="text-sm text-indigo-900/70">No hay eventos próximos.</p> : <div className="space-y-3">{upcoming.map((event) => <div key={event.id} className="rounded-xl bg-white/70 p-3"><p className="text-sm font-bold text-indigo-950">{event.title}</p><p className="mt-1 text-xs text-indigo-900/70">{formatDate(event.date)} · {event.time}</p><p className="mt-1 text-xs text-indigo-900/70">{event.location}</p></div>)}</div>}</section></aside></div>
    {modalOpen && <Modal title={editingId ? 'Editar comunicado' : 'Publicar comunicado'} onClose={() => setModalOpen(false)}>{error && <div className="mb-4"><Alert>{error}</Alert></div>}<form className="space-y-4" onSubmit={submit}><Field label="Título" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><TextArea label="Contenido" required value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Fecha de publicación" type="date" required value={form.publishedAt} onChange={(event) => setForm({ ...form, publishedAt: event.target.value })} /><SelectField label="Nivel de importancia" options={importanceOptions} value={form.importance} onChange={(event) => setForm({ ...form, importance: event.target.value })} /></div><div className="flex justify-end gap-3 pt-3"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit">{editingId ? 'Guardar cambios' : 'Publicar'}</Button></div></form></Modal>}
  </div>
}
