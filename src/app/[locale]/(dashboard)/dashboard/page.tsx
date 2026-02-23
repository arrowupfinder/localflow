'use client'

import { useEffect, useState } from 'react'
import { supabase, ensureProfile } from '@/lib/supabase'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Users, Calendar, FileText, TrendingUp, DollarSign } from 'lucide-react'
import type { Client, Appointment, Invoice } from '@/lib/types'

export default function DashboardPage() {
    const t = useTranslations('dashboard')
    const tNav = useTranslations('nav')
    const locale = useLocale()
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [businessName, setBusinessName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => { checkUser() }, [])

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }
        await ensureProfile(session.user.id, session.user.email || '')
        const { data: profile } = await supabase
            .from('profiles')
            .select('business_name')
            .eq('id', session.user.id)
            .single()
        setBusinessName(profile?.business_name || session.user.email || '')
        fetchData(session.user.id)
    }

    async function fetchData(uid: string) {
        const [c, a, i] = await Promise.all([
            supabase.from('clients').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
            supabase.from('appointments').select('*, clients(name)').eq('user_id', uid).order('date', { ascending: true }),
            supabase.from('invoices').select('*, clients(name)').eq('user_id', uid).order('created_at', { ascending: false }),
        ])
        setClients(c.data || [])
        setAppointments(a.data || [])
        setInvoices(i.data || [])
        setLoading(false)
    }

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
    }

    function switchLocale() {
        const next = locale === 'en' ? 'es' : 'en'
        router.push(`/${next}/dashboard`)
    }

    const today = new Date().toISOString().split('T')[0]
    const todayAppts = appointments.filter(a => a.date === today)
    const pendingInvoices = invoices.filter(i => i.status === 'unpaid')
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0)
    const pendingRevenue = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + Number(i.amount), 0)
    const upcomingAppts = appointments.filter(a => a.date >= today).slice(0, 5)
    const overdueInvoices = invoices.filter(i => i.status === 'unpaid' && i.due_date && i.due_date < today)

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-emerald-400 text-xl animate-pulse">Loading LocalFlow...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* NAVBAR */}
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-white font-bold text-xl">⚡ LocalFlow</span>
                        <div className="hidden md:flex gap-6">
                            <button onClick={() => router.push('./dashboard')}
                                className="text-emerald-400 font-medium text-sm">Dashboard</button>
                            <button onClick={() => router.push('./clients')}
                                className="text-slate-400 hover:text-white text-sm transition">{tNav('clients')}</button>
                            <button onClick={() => router.push('./appointments')}
                                className="text-slate-400 hover:text-white text-sm transition">{tNav('appointments')}</button>
                            <button onClick={() => router.push('./invoices')}
                                className="text-slate-400 hover:text-white text-sm transition">{tNav('invoices')}</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* LANGUAGE SWITCHER */}
                        <button onClick={switchLocale}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition border border-slate-600">
                            {locale === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}
                        </button>
                        <span className="text-slate-500 text-sm hidden md:block">{businessName}</span>
                        <button onClick={handleLogout}
                            className="text-slate-400 hover:text-red-400 text-sm transition">
                            {tNav('logout')}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* HEADER */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {t('welcome')}, {businessName} 👋
                        </h1>
                        <p className="text-slate-400 mt-1">
                            {new Date().toLocaleDateString(locale === 'es' ? 'es-US' : 'en-US', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* OVERDUE ALERT */}
                    {overdueInvoices.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-2 text-sm cursor-pointer hover:bg-red-500/20 transition"
                            onClick={() => router.push('./invoices')}>
                            ⚠ {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: t('totalClients'), value: clients.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', click: './clients' },
                        { label: t('todayAppointments'), value: todayAppts.length, icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-400/10', click: './appointments' },
                        { label: t('pendingInvoices'), value: `$${pendingRevenue.toFixed(0)}`, icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-400/10', click: './invoices' },
                        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10', click: './invoices' },
                    ].map((stat, i) => (
                        <div key={i}
                            onClick={() => router.push(stat.click)}
                            className="bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-2xl p-5 cursor-pointer transition">
                            <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                                <stat.icon className={`${stat.color} w-5 h-5`} />
                            </div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* CONTENT GRID */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* UPCOMING APPOINTMENTS */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white font-semibold">{t('todayAppointments')}</h2>
                            <button onClick={() => router.push('./appointments')}
                                className="text-emerald-400 text-sm hover:text-emerald-300 transition">
                                View all →
                            </button>
                        </div>
                        {upcomingAppts.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">No upcoming appointments</p>
                                <button onClick={() => router.push('./appointments')}
                                    className="mt-3 text-emerald-400 text-sm hover:text-emerald-300">
                                    + Schedule one
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingAppts.map(appt => (
                                    <div key={appt.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                                        <div>
                                            <div className="text-white text-sm font-medium">{appt.service}</div>
                                            <div className="text-slate-400 text-xs mt-0.5">
                                                {(appt.clients as any)?.name} · {appt.date === today ? '🟢 Today' : appt.date} · {appt.time}
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${appt.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                appt.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RECENT CLIENTS + PENDING INVOICES */}
                    <div className="space-y-6">
                        {/* RECENT CLIENTS */}
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white font-semibold">{t('recentClients')}</h2>
                                <button onClick={() => router.push('./clients')}
                                    className="text-emerald-400 text-sm hover:text-emerald-300 transition">
                                    View all →
                                </button>
                            </div>
                            {clients.length === 0 ? (
                                <div className="text-center py-6">
                                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">No clients yet</p>
                                    <button onClick={() => router.push('./clients')}
                                        className="mt-2 text-emerald-400 text-sm">+ Add first client</button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {clients.slice(0, 3).map(client => (
                                        <div key={client.id} className="flex items-center gap-3 p-2">
                                            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
                                                {client.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-white text-sm font-medium">{client.name}</div>
                                                <div className="text-slate-400 text-xs">{client.email || client.phone || '—'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PENDING INVOICES */}
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white font-semibold">{t('pendingInvoices')}</h2>
                                <button onClick={() => router.push('./invoices')}
                                    className="text-emerald-400 text-sm hover:text-emerald-300 transition">
                                    View all →
                                </button>
                            </div>
                            {pendingInvoices.length === 0 ? (
                                <div className="text-center py-6">
                                    <DollarSign className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">All invoices paid! 🎉</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {pendingInvoices.slice(0, 3).map(inv => (
                                        <div key={inv.id} className="flex items-center justify-between p-2">
                                            <div>
                                                <div className="text-white text-sm font-medium">
                                                    {(inv.clients as any)?.name}
                                                </div>
                                                <div className="text-slate-400 text-xs">{inv.description || '—'}</div>
                                            </div>
                                            <div className="text-yellow-400 font-bold text-sm">
                                                ${Number(inv.amount).toFixed(0)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
