'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LocaleSwitcher from '@/components/LocaleSwitcher'

function LogoMark({ size = 32 }: { size?: number }) {
    const r = Math.round(size * 0.25)
    return (
        <div style={{
            width: size, height: size, borderRadius: r,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
            <svg viewBox="0 0 36 36" fill="none" width={size * 0.56} height={size * 0.56}>
                <rect x="5" y="9" width="10" height="10" rx="2.5" fill="white" opacity="0.9" />
                <rect x="20" y="9" width="10" height="10" rx="2.5" fill="white" opacity="0.5" />
                <rect x="5" y="21" width="10" height="5" rx="2" fill="white" opacity="0.4" />
                <rect x="20" y="21" width="10" height="5" rx="2" fill="white" opacity="0.7" />
            </svg>
        </div>
    )
}

export default function LoginPage() {
    const t = useTranslations('auth')
    const tLanding = useTranslations('landing')
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleLogin() {
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { setError(error.message); setLoading(false) }
        else router.push('/dashboard')
    }

    return (
        <main className="min-h-screen flex" style={{ background: 'var(--paper)' }}>
            {/* LEFT — Form */}
            <div className="flex-1 flex flex-col justify-center px-8 py-12 max-w-md mx-auto w-full">
                <div className="flex items-center justify-between w-full mb-12">
                    <Link href="/" className="flex items-center gap-2">
                        <LogoMark size={32} />
                        <span className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>
                            Local<span style={{ color: 'var(--accent-2)' }}>Flow</span>
                        </span>
                    </Link>
                    <LocaleSwitcher />
                </div>

                <h1 className="font-display font-semibold text-3xl mb-2" style={{ color: 'var(--ink)', letterSpacing: '-0.5px' }}>
                    {t('welcomeBack')}
                </h1>
                <p className="text-sm mb-8" style={{ color: 'var(--ink-dim)' }}>
                    {t('loginSubtitle')}
                </p>

                <p className="text-sm mb-8" style={{ color: 'var(--ink-dim)' }}>
                    {t('noAccount')}{' '}
                    <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 500 }}>
                        {t('signUp')}
                    </Link>
                </p>

                {error && (
                    <div className="rounded-xl px-4 py-3 mb-4 text-sm"
                        style={{ background: '#FFF0F0', color: '#C43232', border: '1px solid rgba(196,50,50,0.2)' }}>
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>
                            {t('email')}
                        </label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                            style={{
                                background: 'var(--white)',
                                border: '1.5px solid var(--border)',
                                color: 'var(--ink)',
                                fontFamily: 'DM Sans, sans-serif'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>
                            {t('password')}
                        </label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                            style={{
                                background: 'var(--white)',
                                border: '1.5px solid var(--border)',
                                color: 'var(--ink)',
                                fontFamily: 'DM Sans, sans-serif'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <button onClick={handleLogin} disabled={loading}
                        className="w-full py-3 rounded-xl text-sm font-semibold transition"
                        style={{
                            background: loading ? 'var(--paper-3)' : 'var(--accent)',
                            color: loading ? 'var(--ink-dim)' : 'var(--white)',
                            fontFamily: 'DM Sans, sans-serif'
                        }}>
                        {loading ? t('signingIn') : t('login')}
                    </button>
                </div>
            </div>

            {/* RIGHT — Brand panel */}
            <div className="hidden lg:flex flex-1 flex-col justify-center px-16"
                style={{ background: 'var(--ink)' }}>
                <p className="font-display font-semibold text-4xl mb-4"
                    style={{ color: 'var(--white)', lineHeight: 1.2, letterSpacing: '-1px' }}>
                    {tLanding('testimonial')}
                </p>
                <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {tLanding('testimonialAuthor')}
                </p>

                <div className="mt-12 space-y-4">
                    {[
                        { n: '24', l: tLanding('statClients') },
                        { n: '$4.2k', l: tLanding('statRevenue') },
                        { n: '98%', l: tLanding('statPaper') },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="font-display font-semibold text-2xl"
                                style={{ color: 'var(--accent-2)', minWidth: 64 }}>
                                {s.n}
                            </div>
                            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                {s.l}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}

