import { useState } from 'react'
import { AtSign, Camera, Eye, EyeOff, ImagePlus, KeyRound, Save, ShieldCheck, UserRound, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ROLE_LABELS } from '../data/seedData'
import { Alert, Button, Field } from '../components/ui'

export default function ProfilePage() {
  const { currentUser, users, updateProfile } = useApp()
  const currentAccount = users.find((user) => user.id === currentUser.id)
  const [form, setForm] = useState({ name: currentUser.name, email: currentUser.email, avatar: currentUser.avatar || currentAccount?.avatar || '', currentPassword: currentAccount?.password || '', newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const update = (key, value) => {
    setMessage(null)
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleAvatar = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Selecciona un archivo de imagen válido.' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen debe pesar menos de 2 MB.' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => update('avatar', reader.result)
    reader.onerror = () => setMessage({ type: 'error', text: 'No se pudo leer la imagen seleccionada.' })
    reader.readAsDataURL(file)
  }

  const submit = (event) => {
    event.preventDefault()
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' })
      return
    }
    const result = updateProfile(form)
    setMessage(result.ok ? { type: 'success', text: 'Tu perfil se actualizó correctamente.' } : { type: 'error', text: result.error })
    if (result.ok) setForm((previous) => ({ ...previous, currentPassword: previous.newPassword || previous.currentPassword, newPassword: '', confirmPassword: '' }))
  }

  return <div className="mx-auto max-w-4xl">
    <section className="mb-8 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-soft">
      <div className="relative flex min-h-[210px] items-end justify-between gap-6 overflow-hidden p-6 sm:p-10">
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border-[34px] border-cyan-300/15" />
        <div className="absolute right-24 top-14 h-32 w-32 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="relative">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-cyan-200">Cuenta personal</p>
          <h1 className="text-4xl leading-tight text-white">Mi perfil</h1>
          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-200">Administra tus datos de acceso y mantén actualizada la información con la que sirves a la comunidad.</p>
        </div>
        <div className="relative hidden h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cyan-100 sm:flex"><UserRound size={34} /></div>
      </div>
    </section>
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3"><div className="rounded-lg bg-indigo-100 p-2 text-indigo-700"><UserRound size={20} /></div><div><h2 className="font-bold text-slate-900">Información personal</h2><p className="text-sm text-slate-500">Estos datos aparecen en la barra superior.</p></div></div>
        <div className="grid gap-5 md:grid-cols-2"><Field label="Nombre completo" required value={form.name} onChange={(event) => update('name', event.target.value)} /><Field label="Correo electrónico" type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} /></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"><ShieldCheck size={19} className="text-indigo-600" /><div><p className="text-xs uppercase tracking-wide text-slate-500">Rol asignado</p><p className="mt-1 text-sm font-medium text-slate-900">{ROLE_LABELS[currentUser.role]}</p></div></div><div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"><AtSign size={19} className="text-indigo-600" /><div><p className="text-xs uppercase tracking-wide text-slate-500">Identificador</p><p className="mt-1 truncate font-mono text-xs text-slate-700">{currentUser.id}</p></div></div></div>
        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-indigo-100 text-indigo-700">{form.avatar ? <img src={form.avatar} alt="Vista previa del perfil" className="h-full w-full object-cover" /> : <UserRound size={30} />}</div><div><p className="text-sm font-medium text-slate-900">Imagen de perfil</p><p className="mt-1 text-xs text-slate-500">JPG, PNG o GIF. Máximo 2 MB.</p><div className="mt-3 flex gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"><ImagePlus size={15} />{form.avatar ? 'Cambiar imagen' : 'Agregar imagen'}<input type="file" accept="image/*" className="sr-only" onChange={handleAvatar} /></label>{form.avatar && <button type="button" onClick={() => update('avatar', '')} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-50"><X size={15} />Quitar</button>}</div></div></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3"><div className="rounded-lg bg-indigo-100 p-2 text-indigo-700"><KeyRound size={20} /></div><div><h2 className="font-bold text-slate-900">Seguridad</h2><p className="text-sm text-slate-500">Cambia tu contraseña cuando lo necesites.</p></div></div>
        <div className="grid gap-5 md:grid-cols-3"><label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Contraseña actual</span><div className="relative"><input className="w-full rounded-lg border bg-white px-3 py-2.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type={showCurrentPassword ? 'text' : 'password'} autoComplete="current-password" value={form.currentPassword} onChange={(event) => update('currentPassword', event.target.value)} /><button type="button" className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700" onClick={() => setShowCurrentPassword((visible) => !visible)} aria-label={showCurrentPassword ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}>{showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Nueva contraseña</span><div className="relative"><input className="w-full rounded-lg border bg-white px-3 py-2.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={form.newPassword} onChange={(event) => update('newPassword', event.target.value)} /><button type="button" className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700" onClick={() => setShowNewPassword((visible) => !visible)} aria-label={showNewPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}>{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Confirmar contraseña</span><div className="relative"><input className="w-full rounded-lg border bg-white px-3 py-2.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} /><button type="button" className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label></div>
        {message && <div className="mt-5"><Alert type={message.type}>{message.text}</Alert></div>}
        <p className="mt-4 text-xs leading-5 text-slate-500">La contraseña actual se muestra oculta de forma predeterminada. Deja los campos de nueva contraseña vacíos si no deseas cambiarla.</p>
      </section>
      <div className="flex justify-end"><Button type="submit"><Save size={17} />Guardar perfil</Button></div>
    </form>
  </div>
}
