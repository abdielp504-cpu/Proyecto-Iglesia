import { useMemo, useState } from 'react'
import { Banknote, CalendarDays, CircleDollarSign, CreditCard, FileText, Plus, Receipt, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Alert, Button, Field, Modal, SelectField } from '../components/ui'

const concepts = [
  { value: 'DIEZMO', label: 'Diezmo' },
  { value: 'OFRENDA_GENERAL', label: 'Ofrenda General' },
  { value: 'CONSTRUCCION', label: 'Construcción' },
  { value: 'MISIONES', label: 'Misiones' },
  { value: 'OTRO', label: 'Otro' },
]
const methods = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'DEPOSITO', label: 'Depósito' },
  { value: 'TARJETA', label: 'Tarjeta' },
]
const emptyDonation = { date: new Date().toISOString().slice(0, 10), amount: '', concept: 'DIEZMO', method: 'EFECTIVO', anonymous: false, memberId: '' }

const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
const conceptLabel = (value) => concepts.find((concept) => concept.value === value)?.label || value
const methodLabel = (value) => methods.find((method) => method.value === value)?.label || value

export default function Donations() {
  const { donations, members, addDonation } = useApp()
  const activeMembers = members.filter((member) => member.status === 'ACTIVO')
  const currentMonth = new Date().toISOString().slice(0, 7)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyDonation)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ from: '', to: '', month: currentMonth, concept: 'TODOS' })

  const filtered = useMemo(() => donations.filter((donation) => {
    const matchesFrom = !filters.from || donation.date >= filters.from
    const matchesTo = !filters.to || donation.date <= filters.to
    const matchesConcept = filters.concept === 'TODOS' || donation.concept === filters.concept
    return matchesFrom && matchesTo && matchesConcept
  }).sort((a, b) => b.date.localeCompare(a.date)), [donations, filters])

  const monthly = useMemo(() => donations.filter((donation) => donation.date.startsWith(filters.month)), [donations, filters.month])
  const totalMonth = monthly.reduce((sum, donation) => sum + Number(donation.amount), 0)
  const conceptTotals = concepts.map((concept) => ({ ...concept, total: monthly.filter((donation) => donation.concept === concept.value).reduce((sum, donation) => sum + Number(donation.amount), 0) })).filter((concept) => concept.total > 0)
  const methodTotals = methods.map((method) => ({ ...method, total: monthly.filter((donation) => donation.method === method.value).reduce((sum, donation) => sum + Number(donation.amount), 0) })).filter((method) => method.total > 0)

  const submit = (event) => {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!form.date || !Number.isFinite(amount) || amount <= 0) return setError('Captura una fecha y un monto mayor que cero.')
    if (!form.anonymous && !form.memberId) return setError('Selecciona un miembro o marca la aportación como anónima.')
    addDonation({ ...form, amount, memberId: form.anonymous ? null : form.memberId })
    setForm({ ...emptyDonation, date: new Date().toISOString().slice(0, 10) })
    setError('')
    setModalOpen(false)
  }

  return <div className="mx-auto max-w-7xl">
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-indigo-600">Finanzas</p><h1 className="text-3xl font-bold text-slate-900">Donaciones y aportaciones</h1><p className="mt-2 text-slate-500">Registra y consulta los ingresos de la iglesia.</p></div><Button onClick={() => { setError(''); setModalOpen(true) }}><Plus size={18} />Registrar aportación</Button></div>
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><div className="mb-4 flex items-center gap-2"><FileText size={18} className="text-indigo-600" /><h2 className="font-bold text-slate-900">Filtros de consulta</h2></div><div className="grid gap-4 md:grid-cols-4"><Field label="Desde" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /><Field label="Hasta" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /><Field label="Mes del resumen" type="month" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })} /><SelectField label="Concepto" options={[{ value: 'TODOS', label: 'Todos los conceptos' }, ...concepts]} value={filters.concept} onChange={(event) => setFilters({ ...filters, concept: event.target.value })} /></div></section>
    <section className="mb-6"><div className="mb-4 flex items-center gap-2"><Receipt size={18} className="text-indigo-600" /><h2 className="font-bold text-slate-900">Resumen mensual</h2><span className="text-sm text-slate-500">({filters.month})</span></div><div className="grid gap-4 md:grid-cols-3"><SummaryCard title="Total recaudado" value={money(totalMonth)} icon={CircleDollarSign} /><BreakdownCard title="Por concepto" items={conceptTotals} /><BreakdownCard title="Por método" items={methodTotals} /></div></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Aportaciones registradas</h2><span className="text-sm text-slate-500">{filtered.length} registros</span></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Fecha</th><th className="px-5 py-4">Aportante</th><th className="px-5 py-4">Concepto</th><th className="px-5 py-4">Método</th><th className="px-5 py-4 text-right">Monto</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((donation) => { const member = members.find((item) => item.id === donation.memberId); return <tr key={donation.id} className="hover:bg-slate-50/70"><td className="px-5 py-4 text-slate-600">{donation.date}</td><td className="px-5 py-4"><span className="flex items-center gap-2 text-slate-700"><UserRound size={15} className="text-slate-400" />{donation.anonymous ? 'Anónima' : member?.fullName || 'Miembro no disponible'}</span></td><td className="px-5 py-4"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{conceptLabel(donation.concept)}</span></td><td className="px-5 py-4 text-slate-600">{methodLabel(donation.method)}</td><td className="px-5 py-4 text-right font-bold text-slate-900">{money(donation.amount)}</td></tr> })}</tbody></table></div>{filtered.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No hay aportaciones que coincidan con los filtros.</p>}</section>
    {modalOpen && <Modal title="Registrar aportación" onClose={() => setModalOpen(false)}>{error && <div className="mb-4"><Alert>{error}</Alert></div>}<form className="space-y-4" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><Field label="Fecha" type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /><Field label="Monto (MXN)" type="number" min="0.01" step="0.01" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></div><div className="grid gap-4 sm:grid-cols-2"><SelectField label="Concepto" options={concepts} value={form.concept} onChange={(event) => setForm({ ...form, concept: event.target.value })} /><SelectField label="Método de recepción" options={methods} value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })} /></div><label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3"><input type="checkbox" className="h-4 w-4 accent-indigo-700" checked={form.anonymous} onChange={(event) => setForm({ ...form, anonymous: event.target.checked, memberId: event.target.checked ? '' : form.memberId })} /><span><span className="block text-sm font-semibold text-slate-800">Aportación anónima</span><span className="block text-xs text-slate-500">No se asociará a ningún miembro.</span></span></label>{!form.anonymous && <SelectField label="Miembro aportante" options={[{ value: '', label: 'Selecciona un miembro' }, ...activeMembers.map((member) => ({ value: member.id, label: member.fullName }))]} value={form.memberId} onChange={(event) => setForm({ ...form, memberId: event.target.value })} />}<div className="flex justify-end gap-3 pt-3"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit"><Banknote size={16} />Guardar aportación</Button></div></form></Modal>}
  </div>
}

function SummaryCard({ title, value, icon: Icon }) {
  return <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5"><Icon className="mb-4 text-indigo-700" size={24} /><p className="text-sm font-medium text-indigo-700">{title}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p></div>
}

function BreakdownCard({ title, items }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="mb-4 text-sm font-bold text-slate-700">{title}</p>{items.length === 0 ? <p className="text-sm text-slate-400">Sin movimientos</p> : <div className="space-y-3">{items.map((item) => <div key={item.value} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-slate-600">{item.label}</span><span className="font-bold text-slate-900">{money(item.total)}</span></div>)}</div>}</div>
}
