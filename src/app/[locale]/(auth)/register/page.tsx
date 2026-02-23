'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
    const t = useTranslations('auth')
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleRegister() {
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { business_name: businessName }
            }
        })
        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-4xl mb-2">⚡</div>
                    <h1 className="text-2xl font-bold text-white">LocalFlow</h1>
                    <p className="text-slate-400 mt-1">{t('register')}</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="text-slate-300 text-sm font-medium block mb-1">
                            {t('businessName')}
                        </label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={e => setBusinessName(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                            placeholder="My Business"
                        />
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm font-medium block mb-1">
                            {t('email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm font-medium block mb-1">
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRegister()}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
                    >
                        {loading ? '...' : t('register')}
                    </button>
                </div>

                <p className="text-center text-slate-400 text-sm mt-6">
                    {t('hasAccount')}{' '}
                    <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                        {t('signIn')}
                    </Link>
                </p>
            </div>
        </main>
    )
}
