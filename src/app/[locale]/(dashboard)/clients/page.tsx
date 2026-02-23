'use client'

import { useEffect, useState } from 'react'
import { supabase, ensureProfile } from '@/lib/supabase'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Users, Plus, Phone, Mail, Trash2, X, Search } from 'lucide-react'
import type { Client } from '@/lib/types'
import { canAddClient, PLANS } from '@/lib/plans'

export default function ClientsPage() {
    const t = useTranslations('clients')
    const tNav = useTranslations('nav')
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
    const [userId, setUserId] = useState('')
    const [error, setError] = useState('')
    const [limitReached, setLimitReached] = useState(false)

    useEffect(() => {
        checkUser()
    }, [])

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }

        // Garantiza que el perfil existe
        await ensureProfile(session.user.id, session.user.email || '')

        setUserId(session.user.id)
        fetchClients(session.user.id)
    }

    async function fetchClients(uid: string) {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching clients:', error)
            setError(error.message)
        } else {
            const list = data || []
            setClients(list)
            const check = await canAddClient(list.length)
            setLimitReached(!check.allowed)
        }
        setLoading(false)
    }

    async function saveClient() {
        if (!form.name.trim()) return

        // Verificar límite antes de guardar
        const check = await canAddClient(clients.length)
        if (!check.allowed) {
            setLimitReached(true)
            setShowModal(false)
            return
        }

        setSaving(true)
        setError('')
        const { error } = await supabase
            .from('clients')
            .insert({ ...form, user_id: userId })

        if (error) {
            console.error('Error saving client:', error)
            setError(error.message)
        } else {
            setForm({ name: '', email: '', phone: '', notes: '' })
            setShowModal(false)
            fetchClients(userId)
        }
        setSaving(false)
    }

    async function deleteClient(id: string) {
        if (!confirm('Delete this client?')) return
        const { error } = await supabase.from('clients').delete().eq('id', id)
        if (error) {
            alert('Error deleting client: ' + error.message)
        } else {
            fetchClients(userId)
        }
    }

    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    )

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
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
                                className="text-slate-400 hover:text-white text-sm transition">
                                Dashboard
                            </button>
                            <button onClick={() => router.push('./clients')}
                                className="text-emerald-400 font-medium text-sm">
                                {tNav('clients')}
                            </button>
                            <button onClick={() => router.push('./appointments')}
                                className="text-slate-400 hover:text-white text-sm transition">
                                {tNav('appointments')}
                            </button>
                            <button onClick={() => router.push('./invoices')}
                                className="text-slate-400 hover:text-white text-sm transition">
                                {tNav('invoices')}
                            </button>
                        </div>
                    </div>
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
                        className="text-slate-400 hover:text-red-400 text-sm transition">
                        {tNav('logout')}
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* LIMIT BANNER */}
                {limitReached && (
                    <div className="mb-6 rounded-2xl p-4 flex items-center justify-between"
                        style={{ background: 'var(--warm-lt)', border: '1px solid rgba(183,137,74,0.3)' }}>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--warm)' }}>
                                {t('limitReached')}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-dim)' }}>
                                {t('upgradeTip')}
                            </p>
                        </div>
                        <button
                            className="text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap ml-4"
                            style={{ background: 'var(--warm)', color: 'var(--white)', border: 'none', cursor: 'pointer' }}>
                            {t('upgradeBtn')}
                        </button>
                    </div>
                )}

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-display font-semibold" style={{ color: 'var(--ink)' }}>
                            {t('title')}
                        </h1>
                        <p className="text-sm mt-1" style={{ color: limitReached ? 'var(--warm)' : 'var(--ink-dim)' }}>
                            {clients.length} / {PLANS.free.maxClients} {limitReached ? '⚠ ' : ''}{t('title').toLowerCase()}
                        </p>
                    </div>
                    <button
                        onClick={() => !limitReached && setShowModal(true)}
                        disabled={limitReached}
                        className="font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition"
                        style={{
                            background: limitReached ? 'var(--paper-3)' : 'var(--accent)',
                            color: limitReached ? 'var(--ink-dim)' : 'var(--white)',
                            cursor: limitReached ? 'not-allowed' : 'pointer',
                            border: 'none'
                        }}>
                        <Plus className="w-4 h-4" />
                        {t('addClient')}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* SEARCH */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                </div>

                {/* LIST */}
                {loading ? (
                    <div className="text-center py-20 text-slate-400 animate-pulse">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">{t('noClients')}</p>
                        <button onClick={() => setShowModal(true)}
                            className="mt-4 text-emerald-400 hover:text-emerald-300 transition">
                            + {t('addClient')}
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(client => (
                            <div key={client.id}
                                className="bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-2xl p-5 transition group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                                            {client.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-white font-semibold">{client.name}</div>
                                            <div className="text-slate-400 text-xs">
                                                {new Date(client.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteClient(client.id)}
                                        className="text-slate-500 hover:text-red-400 p-2 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {client.email && (
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Mail className="w-4 h-4" />
                                            {client.email}
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Phone className="w-4 h-4" />
                                            {client.phone}
                                        </div>
                                    )}
                                </div>

                                {client.notes && (
                                    <p className="mt-4 text-xs text-slate-500 line-clamp-2 italic">
                                        "{client.notes}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">{t('addClient')}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-slate-300 text-sm font-medium block mb-1">{t('name')}</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="text-slate-300 text-sm font-medium block mb-1">{t('email')}</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="text-slate-300 text-sm font-medium block mb-1">{t('phone')}</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                            <div>
                                <label className="text-slate-300 text-sm font-medium block mb-1">{t('notes')}</label>
                                <textarea
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition h-24"
                                    placeholder="Add some notes..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={saveClient}
                                    disabled={saving || !form.name}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
                                >
                                    {saving ? '...' : t('save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
