'use client'

import { useEffect, useState } from 'react'
import { supabase, ensureProfile } from '@/lib/supabase'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { FileText, Plus, X, Check, DollarSign } from 'lucide-react'
import type { Invoice, Client } from '@/lib/types'

export default function InvoicesPage() {
    const t = useTranslations('invoices')
    const tNav = useTranslations('nav')
    const router = useRouter()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [userId, setUserId] = useState('')
    const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all')
    const [form, setForm] = useState({
        client_id: '',
        amount: '',
        description: '',
        due_date: '',
        status: 'unpaid'
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
        const [inv, cls] = await Promise.all([
            supabase.from('invoices')
                .select('*, clients(name, email, phone)')
                .eq('user_id', uid)
                .order('created_at', { ascending: false }),
            supabase.from('clients')
                .select('*')
                .eq('user_id', uid)
                .order('name')
        ])
        setInvoices(inv.data || [])
        setClients(cls.data || [])
        setLoading(false)
    }

    async function saveInvoice() {
        if (!form.client_id || !form.amount) return
        setSaving(true)
        const { error } = await supabase.from('invoices').insert({
            client_id: form.client_id,
            user_id: userId,
            amount: parseFloat(form.amount),
            description: form.description,
            due_date: form.due_date || null,
            status: form.status
        })
        if (!error) {
            setForm({ client_id: '', amount: '', description: '', due_date: '', status: 'unpaid' })
            setShowModal(false)
            fetchAll(userId)
        }
        setSaving(false)
    }

    async function markPaid(id: string) {
        await supabase.from('invoices').update({ status: 'paid' }).eq('id', id)
        fetchAll(userId)
    }

    async function deleteInvoice(id: string) {
        if (!confirm('Delete this invoice?')) return
        await supabase.from('invoices').delete().eq('id', id)
        fetchAll(userId)
    }

    const filtered = invoices.filter(i => filter === 'all' || i.status === filter)
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0)
    const totalUnpaid = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + Number(i.amount), 0)

    const invoiceNumber = (index: number) =>
        `INV-${String(invoices.length - index).padStart(4, '0')}`

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
                                className="text-slate-400 hover:text-white text-sm transition">{tNav('appointments')}</button>
                            <button onClick={() => router.push('./invoices')}
                                className="text-emerald-400 font-medium text-sm">{tNav('invoices')}</button>
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
                        <p className="text-slate-400 text-sm mt-1">{invoices.length} total</p>
                    </div>
                    <button onClick={() => setShowModal(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition">
                        <Plus className="w-4 h-4" />
                        {t('addInvoice')}
                    </button>
                </div>

                {/* REVENUE CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Total Collected', amount: totalPaid, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                        { label: 'Pending Payment', amount: totalUnpaid, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                        { label: 'All Time Revenue', amount: totalPaid + totalUnpaid, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    ].map((card, i) => (
                        <div key={i} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                            <div className={`${card.bg} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
                                <DollarSign className={`${card.color} w-4 h-4`} />
                            </div>
                            <div className={`text-2xl font-bold ${card.color}`}>
                                ${card.amount.toFixed(2)}
                            </div>
                            <div className="text-slate-400 text-xs mt-1">{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* FILTERS */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'unpaid', 'paid'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${filter === f
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                                }`}>
                            {f === 'all' ? 'All' : t(f as any)}
                            <span className="ml-2 text-xs opacity-70">
                                ({f === 'all' ? invoices.length : invoices.filter(i => i.status === f).length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* LIST */}
                {loading ? (
                    <div className="text-center py-20 text-slate-400 animate-pulse">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">{t('noInvoices')}</p>
                        <button onClick={() => setShowModal(true)}
                            className="mt-4 text-emerald-400 hover:text-emerald-300 transition">
                            + {t('addInvoice')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((invoice, index) => {
                            const client = invoice.clients as any
                            const isOverdue = invoice.status === 'unpaid' &&
                                invoice.due_date &&
                                invoice.due_date < new Date().toISOString().split('T')[0]

                            return (
                                <div key={invoice.id}
                                    className={`bg-slate-800 border rounded-2xl p-5 transition group ${isOverdue
                                            ? 'border-red-500/40 bg-red-500/5'
                                            : invoice.status === 'paid'
                                                ? 'border-slate-700 opacity-70'
                                                : 'border-slate-700 hover:border-slate-500'
                                        }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* INVOICE NUMBER */}
                                            <div className="bg-slate-700 rounded-xl px-3 py-2 text-center min-w-[80px]">
                                                <div className="text-slate-400 text-xs">Invoice</div>
                                                <div className="text-white text-sm font-bold">{invoiceNumber(index)}</div>
                                            </div>

                                            {/* INFO */}
                                            <div>
                                                <div className="text-white font-semibold">{client?.name}</div>
                                                {invoice.description && (
                                                    <div className="text-slate-400 text-sm mt-0.5">{invoice.description}</div>
                                                )}
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="text-slate-400 text-xs">
                                                        Created {new Date(invoice.created_at).toLocaleDateString()}
                                                    </div>
                                                    {invoice.due_date && (
                                                        <div className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
                                                            {isOverdue ? '⚠ Overdue · ' : 'Due '}
                                                            {new Date(invoice.due_date + 'T00:00:00').toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT */}
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className={`text-xl font-bold ${invoice.status === 'paid' ? 'text-emerald-400' : 'text-white'
                                                    }`}>
                                                    ${Number(invoice.amount).toFixed(2)}
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${invoice.status === 'paid'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                    }`}>
                                                    {t(invoice.status as any)}
                                                </span>
                                            </div>

                                            {/* ACTIONS */}
                                            <div className="hidden group-hover:flex gap-1 ml-2">
                                                {invoice.status === 'unpaid' && (
                                                    <button onClick={() => markPaid(invoice.id)}
                                                        className="w-8 h-8 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg flex items-center justify-center transition"
                                                        title="Mark as paid">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => deleteInvoice(invoice.id)}
                                                    className="w-8 h-8 bg-slate-700 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg flex items-center justify-center transition"
                                                    title="Delete">
                                                    <X className="w-4 h-4" />
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
                            <h2 className="text-white font-bold text-lg">{t('addInvoice')}</h2>
                            <button onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-white transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {clients.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-400 mb-4">Add a client first</p>
                                <button onClick={() => { setShowModal(false); router.push('./clients') }}
                                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl">
                                    Go to Clients
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {/* CLIENT */}
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

                                    {/* AMOUNT */}
                                    <div>
                                        <label className="text-slate-300 text-sm font-medium block mb-1">
                                            {t('amount')} <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={form.amount}
                                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* DESCRIPTION */}
                                    <div>
                                        <label className="text-slate-300 text-sm font-medium block mb-1">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Haircut, Consultation, Repair..."
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                                        />
                                    </div>

                                    {/* DUE DATE */}
                                    <div>
                                        <label className="text-slate-300 text-sm font-medium block mb-1">
                                            {t('dueDate')}
                                        </label>
                                        <input
                                            type="date"
                                            value={form.due_date}
                                            onChange={e => setForm({ ...form, due_date: e.target.value })}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowModal(false)}
                                        className="flex-1 border border-slate-600 text-slate-300 hover:text-white py-3 rounded-xl transition">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveInvoice}
                                        disabled={saving || !form.client_id || !form.amount}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-white font-bold py-3 rounded-xl transition">
                                        {saving ? '...' : t('addInvoice')}
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
