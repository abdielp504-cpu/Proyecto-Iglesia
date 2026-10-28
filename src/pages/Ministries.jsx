import { useMemo, useState } from 'react'
import { BriefcaseBusiness, CalendarDays, Edit3, Link2, Plus, ShieldCheck, UserMinus, UserPlus, Users, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/seedData'
import { Alert, Button, Field, Modal, SelectField, TextArea } from '../components/ui'

const managerRoles = [ROLES.ADMINISTRADOR, ROLES.PASTOR, ROLES.SECRETARIO]
const colorOptions = [{ value: 'indigo', label: 'Índigo' }, { value: 'emerald', label: 'Esmeralda' }, { value: 'amber', label: 'Ámbar' }, { value: 'rose', label: 'Rosa' }]
const emptyMinistry = { name: '', description: '', responsibleId: '', memberIds: [], color: 'indigo' }
const cardColors = { indigo: 'bg-indigo-100 text-indigo-700', emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', rose: 'bg-rose-100 text-rose-700' }

function formatDate(value) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export default function Ministries() {
  const { ministries, members, users, events, currentUser, addMinistry, updateMinistry, toggleMinistryMember } = useApp()
  const canManage = managerRoles.includes(currentUser.role)
  const coordinators = users.filter((user) => user.role === ROLES.COORDINADOR && user.active)
  const activeMembers = members.filter((member) => member.status === 'ACTIVO')
  const [formOpen, setFormOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyMinistry)
  const [error, setError] = useState('')

  const selectedMinistry = ministries.find((ministry) => ministry.id === detail)
  const selectedEvents = useMemo(() => events.filter((event) => event.ministryId === detail).sort((a, b) => a.date.localeCompare(b.date)), [events, detail])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyMinistry, responsibleId: coordinators[0]?.id || '' })
    setError('')
    setFormOpen(true)
  }

  const openEdit = (ministry) => {
    setEditingId(ministry.id)
    setForm({ ...ministry })
    setError('')
    setFormOpen(true)
  }

  const submit = (event) => {
    event.preventDefault()
    if (!form.name.trim()) return setError('El nombre del ministerio es obligatorio.')
    if (!form.responsibleId) return setError('Selecciona un coordinador responsable.')
    if (editingId) updateMinistry(editingId, { ...form, name: form.name.trim() })
    else addMinistry({ ...form, name: form.name.trim() })
    setFormOpen(false)
  }

  return <div className="mx-auto max-w-6xl">
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-indigo-600">Organización</p><h1 className="text-3xl font-bold text-slate-900">Ministerios</h1><p className="mt-2 text-slate-500">Coordina equipos, responsables e integrantes de la iglesia.</p></div>{canManage && <Button onClick={openCreate}><Plus size={18} />Nuevo ministerio</Button>}</div>
    {ministries.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><BriefcaseBusiness className="mx-auto mb-4 text-slate-400" size={36} /><h2 className="font-bold text-slate-900">Aún no hay ministerios</h2><p className="mt-2 text-sm text-slate-500">Crea el primer grupo de trabajo para comenzar.</p></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{ministries.map((ministry) => { const responsible = users.find((user) => user.id === ministry.responsibleId); return <article key={ministry.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"><div className="mb-5 flex items-start justify-between"><div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cardColors[ministry.color] || cardColors.indigo}`}><BriefcaseBusiness size={23} /></div>{canManage && <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600" onClick={() => openEdit(ministry)} aria-label={`Editar ${ministry.name}`}><Edit3 size={17} /></button>}</div><h2 className="text-lg font-bold text-slate-900">{ministry.name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{ministry.description || 'Sin descripción.'}</p><div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm"><p className="flex items-center gap-2 text-slate-600"><ShieldCheck size={16} className="text-indigo-600" />{responsible?.name || 'Sin responsable'}</p><p className="flex items-center gap-2 text-slate-600"><Users size={16} className="text-indigo-600" />{ministry.memberIds.length} integrantes</p></div><Button variant="secondary" className="mt-5 w-full" onClick={() => setDetail(ministry.id)}>Ver detalles</Button></article> })}</div>}
    {formOpen && <Modal title={editingId ? 'Editar ministerio' : 'Crear ministerio'} onClose={() => setFormOpen(false)}>{error && <div className="mb-4"><Alert>{error}</Alert></div>}<form className="space-y-4" onSubmit={submit}><Field label="Nombre del ministerio" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><TextArea label="Descripción" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><SelectField label="Coordinador responsable" options={[{ value: '', label: 'Selecciona un coordinador' }, ...coordinators.map((user) => ({ value: user.id, label: user.name }))]} value={form.responsibleId} onChange={(event) => setForm({ ...form, responsibleId: event.target.value })} /><SelectField label="Color de identificación" options={colorOptions} value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /><div className="flex justify-end gap-3 pt-3"><Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancelar</Button><Button type="submit">{editingId ? 'Guardar cambios' : 'Crear ministerio'}</Button></div></form></Modal>}
    {selectedMinistry && <Modal title={selectedMinistry.name} onClose={() => setDetail(null)}><div className="space-y-6"><div><p className="text-sm leading-6 text-slate-500">{selectedMinistry.description || 'Sin descripción.'}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500"><span className="rounded-full bg-slate-100 px-3 py-1">{selectedMinistry.memberIds.length} integrantes</span><span className="rounded-full bg-slate-100 px-3 py-1">{selectedEvents.length} actividades</span></div></div><section><div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-900">Integrantes activos</h3><span className="text-xs text-slate-500">Vincular / desvincular</span></div><div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-2">{activeMembers.length === 0 && <p className="p-3 text-sm text-slate-500">No hay miembros activos disponibles.</p>}{activeMembers.map((member) => { const linked = selectedMinistry.memberIds.includes(member.id); return <div key={member.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50"><span className="text-sm font-medium text-slate-700">{member.fullName}</span><button className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${linked ? 'text-rose-600 hover:bg-rose-50' : 'text-indigo-700 hover:bg-indigo-50'}`} onClick={() => toggleMinistryMember(selectedMinistry.id, member.id)}>{linked ? <><UserMinus size={14} />Desvincular</> : <><UserPlus size={14} />Vincular</>}</button></div> })}</div></section><section><h3 className="mb-3 font-bold text-slate-900">Actividades programadas</h3>{selectedEvents.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No hay actividades programadas.</p> : <div className="space-y-2">{selectedEvents.map((event) => <div key={event.id} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"><CalendarDays className="mt-0.5 text-indigo-600" size={17} /><div><p className="text-sm font-semibold text-slate-800">{event.title}</p><p className="mt-1 text-xs text-slate-500">{formatDate(event.date)} · {event.time} · {event.location}</p></div></div>)}</div>}</section><div className="flex justify-end"><Button variant="secondary" onClick={() => setDetail(null)}><X size={16} />Cerrar</Button></div></div></Modal>}
  </div>
}
