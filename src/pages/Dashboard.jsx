import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Church,
  CircleDollarSign,
  Megaphone,
  Users,
  WalletCards,
} from 'lucide-react'
import churchAtDusk from '../assets/church-at-dusk.svg'
import { useApp } from '../context/AppContext'
import { ROLE_LABELS, ROLES } from '../data/seedData'

const financialRoles = [ROLES.TESORERO, ROLES.ADMINISTRADOR, ROLES.PASTOR]
const pieColors = ['#0081c0', '#4b806f', '#c18a45', '#b55b55', '#6c8e9c', '#6d6a86']
const conceptLabels = {
  DIEZMO: 'Diezmo',
  OFRENDA_GENERAL: 'Ofrenda',
  CONSTRUCCION: 'Construcción',
  MISIONES: 'Misiones',
  OTRO: 'Otro',
}

function dateOnly(date) {
  return date.toISOString().slice(0, 10)
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(value) {
  return new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(new Date(`${value}-01T00:00:00`)).replace('.', '')
}

export default function Dashboard() {
  const {
    currentUser,
    churchConfig,
    members,
    ministries,
    events,
    attendance,
    donations,
    announcements,
  } = useApp()
  const canSeeFinances = financialRoles.includes(currentUser.role)
  const today = dateOnly(new Date())
  const currentMonth = today.slice(0, 7)
  const activeMembers = members.filter((member) => member.status === 'ACTIVO')
  const inactiveMembers = members.filter((member) => member.status !== 'ACTIVO')
  const upcomingEvents = events
    .filter((event) => event.date >= today && event.status !== 'CANCELADO')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const currentAttendance = attendance.filter((record) => record.date.startsWith(currentMonth))
  const attendanceTotal = currentAttendance.reduce(
    (total, record) => total + record.records.filter((item) => item.status === 'PRESENTE').length,
    0,
  )
  const currentDonations = donations.filter((donation) => donation.date.startsWith(currentMonth))
  const monthlyIncome = currentDonations.reduce((total, donation) => total + Number(donation.amount), 0)
  const importantAnnouncements = announcements
    .filter((announcement) => announcement.importance === 'IMPORTANTE')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3)

  const attendanceChart = useMemo(() => attendance
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((record) => {
      const event = events.find((item) => item.id === record.eventId)
      return {
        name: event?.title || 'Evento',
        fecha: formatDate(record.date),
        presentes: record.records.filter((item) => item.status === 'PRESENTE').length,
        total: record.records.length,
      }
    }), [attendance, events])

  const ministryChart = useMemo(() => ministries.map((ministry) => ({
    name: ministry.name,
    integrantes: ministry.memberIds.length,
  })), [ministries])

  const incomeChart = useMemo(() => {
    const months = []
    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date()
      date.setDate(1)
      date.setMonth(date.getMonth() - index)
      const key = monthKey(date)
      const monthDonations = donations.filter((donation) => donation.date.startsWith(key))
      const values = Object.keys(conceptLabels).reduce((result, concept) => {
        result[concept] = monthDonations
          .filter((donation) => donation.concept === concept)
          .reduce((sum, donation) => sum + Number(donation.amount), 0)
        return result
      }, {})
      months.push({ name: monthLabel(key), ...values })
    }
    return months
  }, [donations])

  const kpis = [
    { label: 'Miembros activos', value: activeMembers.length, detail: `${inactiveMembers.length} inactivos`, icon: Users, tone: 'indigo' },
    { label: 'Próximos eventos', value: upcomingEvents.length, detail: 'programados desde hoy', icon: CalendarDays, tone: 'emerald' },
    { label: 'Asistencias del mes', value: attendanceTotal, detail: 'personas presentes', icon: Activity, tone: 'amber' },
    { label: 'Ministerios', value: ministries.length, detail: 'grupos registrados', icon: Church, tone: 'rose' },
  ]

  return <div className="mx-auto max-w-7xl">
    <section className="relative mb-10 min-h-[310px] overflow-hidden rounded-2xl bg-slate-950 text-white shadow-soft sm:min-h-[350px]">
      <img src={churchAtDusk} alt="Iglesia al atardecer" className="absolute inset-0 h-full w-full object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/45 to-transparent" />
      <div className="relative flex min-h-[310px] max-w-2xl flex-col justify-end p-6 sm:min-h-[350px] sm:p-10">
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-cyan-200">{ROLE_LABELS[currentUser.role]} · {churchConfig.name}</p>
        <div className="mb-4 paper-rule bg-cyan-200" />
        <h1 className="max-w-2xl text-4xl leading-tight text-white sm:text-5xl">Cuidar una iglesia también es cuidar sus detalles.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200">Este es el pulso de tu comunidad: personas, encuentros y recursos reunidos para servir mejor.</p>
      </div>
    </section>

    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-indigo-600">{ROLE_LABELS[currentUser.role]} · {churchConfig.name}</p>
        <div className="paper-rule mb-4" />
        <h2 className="text-3xl leading-tight text-slate-900">El pulso de la comunidad</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">Un resumen para acompañar cada área con atención.</p>
      </div>
      <span className="border-b border-slate-300 pb-2 text-xs font-medium text-slate-500">Actualizado hoy</span>
    </div>

    <div className={`grid gap-4 ${canSeeFinances ? 'md:grid-cols-3 xl:grid-cols-5' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
      {kpis.map(({ label, value, detail, icon: Icon, tone }) => <KpiCard key={label} label={label} value={value} detail={detail} icon={Icon} tone={tone} />)}
      {canSeeFinances && <KpiCard label="Ingresos del mes" value={formatMoney(monthlyIncome)} detail="aportaciones registradas" icon={CircleDollarSign} tone="violet" />}
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <ChartCard title="Historial de asistencias" subtitle="Personas presentes por evento" icon={Activity}>
        {attendanceChart.length === 0 ? <EmptyChart message="Aún no hay registros de asistencia." /> : <ResponsiveContainer width="100%" height={280}><AreaChart data={attendanceChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} labelFormatter={(value, payload) => payload?.[0]?.payload?.fecha || value} /><Area type="monotone" dataKey="presentes" name="Presentes" stroke="#4f46e5" strokeWidth={3} fill="url(#attendanceFill)" /></AreaChart></ResponsiveContainer>}
      </ChartCard>
      <ChartCard title="Miembros por ministerio" subtitle="Distribución de integrantes vinculados" icon={Users}>
        {ministryChart.length === 0 ? <EmptyChart message="Aún no hay ministerios registrados." /> : <div className="flex flex-col items-center gap-4 sm:flex-row"><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={ministryChart} dataKey="integrantes" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>{ministryChart.map((entry, index) => <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />)}</Pie><Tooltip formatter={(value) => [`${value} integrantes`, 'Total']} /><Legend wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></div>}
      </ChartCard>
    </div>

    {canSeeFinances && <div className="mt-6"><ChartCard title="Ingresos mensuales por concepto" subtitle="Desglose de los últimos seis meses" icon={WalletCards}><ResponsiveContainer width="100%" height={300}><BarChart data={incomeChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} /><Tooltip formatter={(value, name) => [formatMoney(value), conceptLabels[name] || name]} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} /><Legend formatter={(value) => conceptLabels[value] || value} wrapperStyle={{ fontSize: 12 }} />{Object.keys(conceptLabels).map((concept, index) => <Bar key={concept} dataKey={concept} name={concept} stackId="income" fill={pieColors[index % pieColors.length]} radius={index === Object.keys(conceptLabels).length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]} />)}</BarChart></ResponsiveContainer></ChartCard></div>}

    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">Próximos eventos</h2><p className="mt-1 text-sm text-slate-500">Tu agenda más cercana.</p></div><Link to="/eventos" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900">Ver todos <ArrowUpRight size={15} /></Link></div>
        <div className="space-y-3">{upcomingEvents.slice(0, 4).map((event) => <div key={event.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="flex min-w-12 flex-col items-center rounded-lg bg-indigo-100 px-2 py-1 text-indigo-700"><span className="text-xs font-bold uppercase">{new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(new Date(`${event.date}T00:00:00`))}</span><span className="text-lg font-bold">{Number(event.date.slice(8))}</span></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{event.title}</p><p className="mt-1 text-xs text-slate-500">{event.time} · {event.location}</p></div></div>)}{upcomingEvents.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No hay próximos eventos.</p>}</div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">Avisos importantes</h2><p className="mt-1 text-sm text-slate-500">Últimos comunicados destacados.</p></div><Link to="/comunicados" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900">Ver muro <ArrowUpRight size={15} /></Link></div>
        <div className="space-y-3">{importantAnnouncements.map((announcement) => <div key={announcement.id} className="flex gap-3 rounded-xl bg-amber-50 p-3"><Megaphone className="mt-0.5 shrink-0 text-amber-600" size={18} /><div><p className="text-sm font-semibold text-slate-900">{announcement.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{announcement.content}</p><p className="mt-2 text-[11px] text-slate-400">{formatDate(announcement.publishedAt)}</p></div></div>)}{importantAnnouncements.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No hay avisos importantes.</p>}</div>
      </section>
    </div>
  </div>
}

function KpiCard({ label, value, detail, icon: Icon, tone }) {
  const tones = { indigo: 'bg-indigo-100 text-indigo-700', emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', rose: 'bg-rose-100 text-rose-700', violet: 'bg-violet-100 text-violet-700' }
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div><div className={`rounded-xl p-3 ${tones[tone]}`}><Icon size={21} /></div></div><p className="mt-4 text-xs text-slate-500">{detail}</p></div>
}

function ChartCard({ title, subtitle, icon: Icon, children }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><div className="mb-4 flex items-center gap-3"><div className="rounded-lg bg-indigo-100 p-2 text-indigo-700"><Icon size={18} /></div><div><h2 className="font-bold text-slate-900">{title}</h2><p className="text-xs text-slate-500">{subtitle}</p></div></div>{children}</section>
}

function EmptyChart({ message }) {
  return <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">{message}</div>
}
