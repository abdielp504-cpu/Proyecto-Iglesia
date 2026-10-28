import { AlertCircle, CheckCircle2, X } from 'lucide-react'

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-slate-900 text-white hover:bg-slate-950 focus:ring-indigo-300',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-200',
    danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-200',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-200',
  }
  return <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium tracking-tight transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>{children}</button>
}

export function Field({ label, error, className = '', ...props }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span><input className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${error ? 'border-rose-400' : 'border-slate-200'}`} {...props} />{error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}</label>
}

export function TextArea({ label, className = '', ...props }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span><textarea className="min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" {...props} /></label>
}

export function SelectField({ label, options, ...props }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span><select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" {...props}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
}

export function Alert({ children, type = 'error', onClose }) {
  const success = type === 'success'
  return <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}><span className="mt-0.5">{success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}</span><span className="flex-1">{children}</span>{onClose && <button onClick={onClose} aria-label="Cerrar"><X size={16} /></button>}</div>
}

export function Modal({ title, children, onClose }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><h2 className="text-lg font-bold text-slate-900">{title}</h2><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></div><div className="p-6">{children}</div></div></div>
}
