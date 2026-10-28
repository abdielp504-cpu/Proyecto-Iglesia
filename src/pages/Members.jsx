import { useMemo, useState } from 'react'
import { Edit3, Mail, Phone, Plus, Search, UserCheck, UserX, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/seedData'
import { Alert, Button, Field, Modal, SelectField } from '../components/ui'
import membersGarden from '../assets/members-garden.svg'

const editableRoles = [ROLES.ADMINISTRADOR, ROLES.PASTOR, ROLES.SECRETARIO]
const emptyMember = { fullName: '', phone: '', email: '', joinDate: '', status: 'ACTIVO' }
const statusOptions = [
  { value: 'TODOS', label: 'Todos los estados' },
  { value: 'ACTIVO', label: 'Activos' },
  { value: 'INACTIVO', label: 'Inactivos' },
]

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export default function Members() {
  const { members, currentUser, addMember, updateMember, toggleMemberStatus } = useApp()
  const canEdit = editableRoles.includes(currentUser.role)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('TODOS')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyMember)
  const [error, setError] = useState('')

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return members.filter((member) => {
      const matchesQuery = !normalizedQuery || member.fullName.toLowerCase().includes(normalizedQuery)
      const matchesStatus = status === 'TODOS' || member.status === status
      return matchesQuery && matchesStatus
    })
  }, [members, query, status])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyMember, joinDate: new Date().toISOString().slice(0, 10) })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (member) => {
    setEditingId(member.id)
    setForm({ ...member })
    setError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setError('')
  }

  const submit = (event) => {
    event.preventDefault()
    if (!form.fullName.trim()) return setError('El nombre completo es obligatorio.')
    if (!form.joinDate) return setError('La fecha de ingreso es obligatoria.')
    if (!form.phone.trim() && !form.email.trim()) return setError('Captura al menos un teléfono o correo electrónico.')
    if (editingId) updateMember(editingId, { ...form, fullName: form.fullName.trim() })
    else addMember({ ...form, fullName: form.fullName.trim() })
    closeModal()
  }

  return <div className="mx-auto max-w-6xl">
    <section className="relative mb-8 min-h-[225px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"><img src={membersGarden} alt="Miembros de la iglesia reunidos en comunidad" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" /><div className="relative flex min-h-[225px] max-w-xl flex-col justify-center p-6 sm:p-10"><p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-indigo-600">Comunidad y cuidado</p><h1 className="text-4xl leading-tight text-slate-900">Miembros</h1><p className="mt-3 text-sm leading-7 text-slate-500">Conoce y acompaña a las personas que forman parte de la vida de la iglesia.</p>{canEdit && <Button className="mt-5 w-fit" onClick={openCreate}><Plus size={18} />Nuevo miembro</Button>}</div></section>
    <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-[1fr_220px]">
      <label className="relative block"><span className="sr-only">Buscar por nombre</span><Search className="absolute left-3 top-2.5 text-slate-400" size={18} /><input className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="Buscar por nombre..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <SelectField label="Estado" options={statusOptions} value={status} onChange={(event) => setStatus(event.target.value)} />
    </div>
    <div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><Users size={17} />{filteredMembers.length} {filteredMembers.length === 1 ? 'miembro encontrado' : 'miembros encontrados'}</div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4 font-semibold">Miembro</th><th className="px-6 py-4 font-semibold">Contacto</th><th className="px-6 py-4 font-semibold">Ingreso</th><th className="px-6 py-4 font-semibold">Estado</th>{canEdit && <th className="px-6 py-4 text-right font-semibold">Acciones</th>}</tr></thead>
        <tbody className="divide-y divide-slate-100">{filteredMembers.map((member) => <tr key={member.id} className="hover:bg-slate-50/70"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">{member.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><p className="font-semibold text-slate-900">{member.fullName}</p></div></td><td className="space-y-1 px-6 py-4 text-xs text-slate-500"><p className="flex items-center gap-1.5"><Phone size={14} />{member.phone || 'Sin teléfono'}</p><p className="flex items-center gap-1.5"><Mail size={14} />{member.email || 'Sin correo'}</p></td><td className="px-6 py-4 text-slate-600">{formatDate(member.joinDate)}</td><td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${member.status === 'ACTIVO' ? 'text-emerald-600' : 'text-slate-500'}`}><span className={`h-2 w-2 rounded-full ${member.status === 'ACTIVO' ? 'bg-emerald-500' : 'bg-slate-400'}`} />{member.status === 'ACTIVO' ? 'Activo' : 'Inactivo'}</span></td>{canEdit && <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50" onClick={() => openEdit(member)} aria-label={`Editar ${member.fullName}`}><Edit3 size={16} /></button><button className={`rounded-lg p-2 ${member.status === 'ACTIVO' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`} onClick={() => toggleMemberStatus(member.id)} aria-label={`${member.status === 'ACTIVO' ? 'Desactivar' : 'Reactivar'} ${member.fullName}`}>{member.status === 'ACTIVO' ? <UserX size={16} /> : <UserCheck size={16} />}</button></div></td>}</tr>)}</tbody>
      </table></div>
      {filteredMembers.length === 0 && <div className="px-6 py-12 text-center text-sm text-slate-500">No hay miembros que coincidan con los filtros.</div>}
    </div>
    {modalOpen && <Modal title={editingId ? 'Editar miembro' : 'Registrar miembro'} onClose={closeModal}>{error && <div className="mb-4"><Alert>{error}</Alert></div>}<form className="space-y-4" onSubmit={submit}><Field label="Nombre completo" required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Teléfono" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /><Field label="Correo electrónico" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Fecha de ingreso" type="date" required value={form.joinDate} onChange={(event) => setForm({ ...form, joinDate: event.target.value })} /><SelectField label="Estado" options={statusOptions.slice(1)} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} /></div><div className="flex justify-end gap-3 pt-3"><Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button><Button type="submit">{editingId ? 'Guardar cambios' : 'Registrar miembro'}</Button></div></form></Modal>}
  </div>
}
