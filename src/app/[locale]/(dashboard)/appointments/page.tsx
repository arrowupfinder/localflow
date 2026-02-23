'use client'

import { useEffect, useState } from 'react'
import { supabase, ensureProfile } from '@/lib/supabase'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, Clock, X, Check, XCircle } from 'lucide-react'
import type { Appointment, Client } from '@/lib/types'

export default function AppointmentsPage() {
    const t = useTranslations('appointments')
    const tNav = useTranslations('nav')
    const router = useRouter()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [userId, setUserId] = useState('')
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
    const [form, setForm] = useState({
        client_id: '',
        service: '',
        date: '',
        time: '',
        status: 'pending',
        notes: ''
    })

    useEffect(() => { checkUser() }, [])

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }
        await ensureProfile(session.user.id, session.user.email || '')
        setUserId(session.user.id)
        fetchAll(session.user.id)
    }

    async function fetchAll(uid: string) {
        const [appts, cls] = await Promise.all([
            supabase.from('appointments')
                .select('*, clients(name, email, phone)')
                .eq('user_id', uid)
                .order('date', { ascending: true })
                .order('time', { ascending: true }),
            supabase.from('clients')
                .select('*')
                .eq('user_id', uid)
                .order('name')
        ])
        setAppointments(appts.data || [])
        setClients(cls.data || [])
        setLoading(false)
    }

    async function saveAppointment() {
        if (!form.client_id || !form.service || !form.date || !form.time) return
        setSaving(true)
        const { error } = await supabase
            .from('appointments')
            .insert({ ...form, user_id: userId })
        if (!error) {
            setForm({ client_id: '', service: '', date: '', time: '', status: 'pending', notes: '' })
            setShowModal(false)
            fetchAll(userId)
        }
        setSaving(false)
    }

    async function updateStatus(id: string, status: string) {
        await supabase.from('appointments').update({ status }).eq('id', id)
        fetchAll(userId)
    }

    async function deleteAppointment(id: string) {
        if (!confirm('Delete this appointment?')) return
        await supabase.from('appointments').delete().eq('id', id)
        fetchAll(userId)
    }

    const filtered = appointments.filter(a => filter === 'all' || a.status === filter)

    const statusColor = (status: string) => {
        if (status === 'confirmed') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        if (status === 'cancelled') return 'bg-red-500/20 text-red-400 border-red-500/30'
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }

    const isToday = (date: string) => date === new Date().toISOString().split('T')[0]
    const isPast = (date: string) => date < new Date().toISOString().split('T')[0]

    return (
        <div className="min-h-screen bg-slate-900">
            {/* NAVBAR */}
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-white font-bold text-xl cursor-pointer"
                            onClick={() => router.push('./dashboard')}>
                            ⚡ LocalFlow
                        </span>
                        <div className="hidden md:flex gap-6">
                            <button onClick={() => router.push('./dashboard')}
                                className="text-slate-400 hover:text-white text-sm transition">Dashboard</button>
                            <button onClick={() => router.push('./clients')}
                                className="text-slate-400 hover:text-white text-sm transition">{tNav('clients')}</button>
                            <button onClick={() => router.push('./appointments')}
                                className="text-emerald-400 font-medium text-sm">{tNav('appointments')}</button>
                            <button onClick={() => router.push('./invoices')}
                                className="text-slate-400 hover:text-white text-sm transition">{tNav('invoices')}</button>
                        </div>
                    </div>
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
                        className="text-slate-400 hover:text-red-400 text-sm transition">
                        {tNav('logout')}
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
                        <p className="text-slate-400 text-sm mt-1">{appointments.length} total</p>
                    </div>
                    <button onClick={() => setShowModal(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition">
                        <Plus className="w-4 h-4" />
                        {t('addAppointment')}
                    </button>
                </div>

                {/* FILTERS */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${filter === f
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                                }`}>
                            {f === 'all' ? 'All' : t(f as any)}
                            {f !== 'all' && (
                                <span className="ml-2 text-xs opacity-70">
                                    ({appointments.filter(a => a.status === f).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* LIST */}
                {loading ? (
                    <div className="text-center py-20 text-slate-400 animate-pulse">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">{t('noAppointments')}</p>
                        {clients.length === 0 && (
                            <p className="text-slate-500 text-sm mt-2">Add a client first</p>
                        )}
                        <button onClick={() => setShowModal(true)}
                            className="mt-4 text-emerald-400 hover:text-emerald-300 transition">
                            + {t('addAppointment')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(appt => {
                            const client = appt.clients as any
                            return (
                                <div key={appt.id}
                                    className={`bg-slate-800 border rounded-2xl p-5 transition group ${isToday(appt.date)
                                            ? 'border-emerald-500/50 bg-emerald-500/5'
                                            : isPast(appt.date)
                                                ? 'border-slate-700 opacity-60'
                                                : 'border-slate-700 hover:border-slate-500'
                                        }`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            {/* DATE BLOCK */}
                                            <div className="bg-slate-700 rounded-xl p-3 text-center min-w-[60px]">
                                                <div className="text-emerald-400 text-xs font-bold uppercase">
                                                    {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                                                </div>
                                                <div className="text-white text-2xl font-bold leading-none">
                                                    {new Date(appt.date + 'T00:00:00').getDate()}
                                                </div>
                                                {isToday(appt.date) && (
                                                    <div className="text-emerald-400 text-xs mt-1">TODAY</div>
                                                )}
                                            </div>

                                            {/* INFO */}
                                            <div>
                                                <div className="text-white font-semibold">{appt.service}</div>
                                                <div className="text-slate-300 text-sm mt-1">{client?.name}</div>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                                                        <Clock className="w-3 h-3" />
                                                        {appt.time}
                                                    </div>
                                                    {client?.phone && (
                                                        <div className="text-slate-400 text-xs">{client.phone}</div>
                                                    )}
                                                </div>
                                                {appt.notes && (
                                                    <div className="text-slate-500 text-xs mt-2">{appt.notes}</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* RIGHT SIDE */}
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-3 py-1 rounded-full border ${statusColor(appt.status)}`}>
                                                {t(appt.status as any)}
                                            </span>

                                            {/* ACTION BUTTONS */}
                                            <div className="hidden group-hover:flex gap-1 ml-2">
                                                {appt.status === 'pending' && (
                                                    <button onClick={() => updateStatus(appt.id, 'confirmed')}
                                                        className="w-7 h-7 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg flex items-center justify-center transition"
                                                        title="Confirm">
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                )}
                                                {appt.status !== 'cancelled' && (
                                                    <button onClick={() => updateStatus(appt.id, 'cancelled')}
                                                        className="w-7 h-7 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg flex items-center justify-center transition"
                                                        title="Cancel">
                                                        <XCircle className="w-3 h-3" />
                                                    </button>
                                                )}
                                                <button onClick={() => deleteAppointment(appt.id)}
                                                    className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-slate-400 rounded-lg flex items-center justify-center transition"
                                                    title="Delete">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-white font-bold text-lg">{t('addAppointment')}</h2>
                            <button onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-white transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {clients.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-400 mb-4">You need to add a client first</p>
                                <button onClick={() => { setShowModal(false); router.push('./clients') }}
                                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl">
                                    Go to Clients
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {/* CLIENT SELECT */}
                                    <div>
                                        <label className="text-slate-300 text-sm font-medium block mb-1">
                                            {t('client')} <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            value={form.client_id}
                                            onChange={e => setForm({ ...form, client_id: e.target.value })}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition">
                                            <option value="">Select client...</option>
                                            {clients.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* SERVICE */}
                                    <div>
                                        <label className="text-slate-300 text-sm font-medium block mb-1">
                                            {t('service')} <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Haircut, Consultation, Cleaning..."
                                            value={form.service}
                                            onChange={e => setForm({ ...form, service: e.target.value })}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                                        />
                                    </div>

                                    {/* DATE & TIME */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-slate-300 text-sm font-medium block mb-1">
                                                {t('date')} <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={form.date}
                                                onChange={e => setForm({ ...form, date: e.target.value })}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-slate-300 text-sm font-medium block mb-1">
                                                {t('time')} <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                value={form.time}
                                                onChange={e => setForm({ ...form, time: e.target.value })}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* STATUS */}
                                    <div>
                                        <label className="text-slate-300 text-sm font-medium block mb-1">
                                            {t('status')}
                                        </label>
                                        <select
                                            value={form.status}
                                            onChange={e => setForm({ ...form, status: e.target.value })}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition">
                                            <option value="pending">{t('pending')}</option>
                                            <option value="confirmed">{t('confirmed')}</option>
                                        </select>
                                    </div>

                                    {/* NOTES */}
                                    <div>
                                        <label className="text-slate-300 text-sm font-medium block mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            placeholder="Any special notes..."
                                            value={form.notes}
                                            onChange={e => setForm({ ...form, notes: e.target.value })}
                                            rows={2}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowModal(false)}
                                        className="flex-1 border border-slate-600 text-slate-300 hover:text-white py-3 rounded-xl transition">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveAppointment}
                                        disabled={saving || !form.client_id || !form.service || !form.date || !form.time}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-white font-bold py-3 rounded-xl transition">
                                        {saving ? '...' : t('addAppointment')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
