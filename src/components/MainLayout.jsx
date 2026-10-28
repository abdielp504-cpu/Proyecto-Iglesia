import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Church, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, UserRound, Users, BriefcaseBusiness, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ROLE_LABELS, ROLES } from '../data/seedData'

const menuItems = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, roles: Object.values(ROLES) },
  { to: '/usuarios', label: 'Usuarios', icon: ShieldCheck, roles: [ROLES.ADMINISTRADOR] },
  { to: '/miembros', label: 'Miembros', icon: Users, roles: [ROLES.ADMINISTRADOR, ROLES.PASTOR, ROLES.SECRETARIO, ROLES.COORDINADOR] },
  { to: '/ministerios', label: 'Ministerios', icon: BriefcaseBusiness, roles: Object.values(ROLES) },
  { to: '/configuracion', label: 'Configuración', icon: Settings, roles: [ROLES.ADMINISTRADOR, ROLES.PASTOR] },
]

export default function MainLayout() {
  const { currentUser, churchConfig, logout } = useApp()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const signOut = () => { logout(); navigate('/login') }
  return <div className="min-h-screen bg-slate-50">
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-950 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6"><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-indigo-600">{churchConfig.logo ? <img src={churchConfig.logo} alt="" className="h-full w-full object-cover" /> : <Church size={22} />}</div><div className="min-w-0"><p className="truncate font-bold">{churchConfig.name}</p><p className="text-xs text-slate-400">Panel de gestión</p></div><button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X size={20} /></button></div>
      <nav className="space-y-1 px-3 py-6">{menuItems.filter((item) => item.roles.includes(currentUser.role)).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon size={19} />{label}</NavLink>)}</nav>
      <div className="absolute bottom-0 w-full border-t border-white/10 p-4"><button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"><LogOut size={19} />Cerrar sesión</button></div>
    </aside>
    {open && <button className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú" />}
    <div className="lg:pl-72"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8"><button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu size={22} /></button><div className="hidden lg:block"><p className="text-sm text-slate-500">Bienvenido de nuevo</p><p className="font-semibold text-slate-900">{currentUser.name}</p></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-900">{currentUser.name}</p><p className="text-xs text-indigo-600">{ROLE_LABELS[currentUser.role]}</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700"><UserRound size={20} /></div></div></header><main className="p-4 sm:p-8"><Outlet /></main></div>
  </div>
}
