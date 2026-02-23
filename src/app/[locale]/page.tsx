import { getTranslations } from 'next-intl/server'
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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'landing' })
    const tAuth = await getTranslations({ locale, namespace: 'auth' })

    return (
        <main className="min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>

            {/* NAV */}
            <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}
                className="px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <LogoMark size={32} />
                    <span className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>
                        Local<span style={{ color: 'var(--accent-2)' }}>Flow</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {/* LANGUAGE SWITCHER */}
                    <LocaleSwitcher />
                    <Link href="/login"
                        className="text-sm font-medium px-4 py-2 rounded-lg transition"
                        style={{ color: 'var(--ink-soft)' }}>
                        {tAuth('login')}
                    </Link>
                    <Link href="/register"
                        className="text-sm font-semibold px-4 py-2 rounded-lg transition"
                        style={{ background: 'var(--accent)', color: 'var(--white)' }}>
                        {tAuth('register')}
                    </Link>
                </div>
            </nav>

            {/* HERO */}
            <section className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
                    style={{ background: 'var(--accent-lt)', color: 'var(--accent)', border: '1px solid rgba(45,106,79,0.2)' }}>
                    ✦ {t('badge')}
                </div>

                <h1 className="font-display font-semibold mb-6 max-w-2xl"
                    style={{ fontSize: 'clamp(40px, 6vw, 68px)', lineHeight: 1.1, letterSpacing: '-2px', color: 'var(--ink)' }}>
                    {t('heroTitle')}
                    <span style={{ color: 'var(--accent)' }}> {t('heroAccent')}</span>
                </h1>

                <p className="text-lg mb-10 max-w-lg" style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                    {t('heroDesc')}
                </p>

                <div className="flex gap-3 flex-wrap justify-center mb-16">
                    <Link href="/register"
                        className="font-semibold px-8 py-3 rounded-xl text-base transition"
                        style={{ background: 'var(--accent)', color: 'var(--white)' }}>
                        {t('startFree')}
                    </Link>
                    <Link href="/login"
                        className="font-medium px-8 py-3 rounded-xl text-base transition"
                        style={{ background: 'var(--white)', color: 'var(--ink)', border: '1px solid var(--border)' }}>
                        {t('signIn')}
                    </Link>
                </div>

                {/* MINI MOCKUP */}
                <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl"
                    style={{ border: '1px solid var(--border)' }}>
                    <div className="px-4 py-3 flex items-center gap-2"
                        style={{ background: '#F0EDE8', borderBottom: '1px solid var(--border)' }}>
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <div className="ml-3 px-3 py-1 rounded-md text-xs"
                            style={{ background: 'var(--white)', color: 'var(--ink-dim)' }}>
                            localflow.app/{locale}/dashboard
                        </div>
                    </div>
                    <div className="p-6" style={{ background: 'var(--paper)' }}>
                        <p className="font-display font-semibold text-lg mb-1" style={{ color: 'var(--ink)' }}>
                            {t('statClients') === 'Happy clients' ? "Welcome back, Maria's Salon 👋" : "Bienvenida, Salón de María 👋"}
                        </p>
                        <p className="text-xs mb-4" style={{ color: 'var(--ink-dim)' }}>Monday, February 23, 2026</p>
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {[
                                { val: '24', lbl: t('statClients'), c: 'var(--accent)' },
                                { val: '3', lbl: t('todayAppointments') ?? "Today's Appts", c: 'var(--ink)' },
                                { val: '$840', lbl: t('planFreeF2'), c: 'var(--warm)' },
                                { val: '$4.2k', lbl: t('statRevenue'), c: 'var(--ink)' },
                            ].map((s, i) => (
                                <div key={i} className="rounded-xl p-3 text-center"
                                    style={{ background: 'var(--white)', border: '1px solid var(--border)' }}>
                                    <div className="font-display font-semibold text-lg" style={{ color: s.c }}>{s.val}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--ink-dim)' }}>{s.lbl}</div>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'var(--white)', border: '1px solid var(--border)' }}>
                            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--ink)' }}>
                                {t('feature2Title')}
                            </p>
                            {[
                                { name: 'Sofia · Haircut · 9:00am', status: 'Confirmed' },
                                { name: 'Carlos · Color · 11:30am', status: 'Pending' },
                            ].map((a, i) => (
                                <div key={i} className="flex items-center justify-between py-2"
                                    style={{ borderTop: i > 0 ? '1px solid var(--paper-2)' : 'none' }}>
                                    <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{a.name}</span>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                                        style={{ background: 'var(--accent-lt)', color: 'var(--accent)' }}>
                                        {a.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="px-8 py-20" style={{ background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
                <div className="max-w-4xl mx-auto">
                    <p className="text-center text-xs font-semibold tracking-widest uppercase mb-12"
                        style={{ color: 'var(--accent)' }}>
                        {t('featuresLabel')}
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: '👥', title: t('feature1Title'), desc: t('feature1Desc') },
                            { icon: '📅', title: t('feature2Title'), desc: t('feature2Desc') },
                            { icon: '🧾', title: t('feature3Title'), desc: t('feature3Desc') },
                        ].map((f, i) => (
                            <div key={i} className="text-center p-6 rounded-2xl"
                                style={{ background: 'var(--paper)', border: '1px solid var(--border)' }}>
                                <div className="text-3xl mb-4">{f.icon}</div>
                                <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--ink)' }}>
                                    {f.title}
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section className="px-8 py-20" style={{ background: 'var(--paper)' }}>
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xs font-semibold tracking-widest uppercase mb-4"
                        style={{ color: 'var(--accent)' }}>
                        {t('pricingLabel')}
                    </p>
                    <h2 className="font-display font-semibold text-4xl mb-4"
                        style={{ color: 'var(--ink)', letterSpacing: '-1px' }}>
                        {t('pricingTitle')}
                    </h2>
                    <p className="mb-12 text-base" style={{ color: 'var(--ink-soft)' }}>
                        {t('pricingDesc')}
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 text-left">
                        {[
                            {
                                name: t('planFreeName'), price: '$0', period: '/mo',
                                desc: t('planFreeDesc'),
                                features: [t('planFreeF1'), t('planFreeF2'), t('planFreeF3'), t('planFreeF4')],
                                cta: t('planFreeCta'), primary: false
                            },
                            {
                                name: t('planGrowthName'), price: '$19', period: '/mo',
                                desc: t('planGrowthDesc'),
                                features: [t('planGrowthF1'), t('planGrowthF2'), t('planGrowthF3'), t('planGrowthF4')],
                                cta: t('planGrowthCta'), primary: true
                            },
                        ].map((plan, i) => (
                            <div key={i} className="rounded-2xl p-8"
                                style={{
                                    background: plan.primary ? 'var(--accent)' : 'var(--white)',
                                    border: `1px solid ${plan.primary ? 'transparent' : 'var(--border)'}`,
                                }}>
                                <p className="text-xs font-semibold tracking-widest uppercase mb-2"
                                    style={{ color: plan.primary ? 'rgba(255,255,255,0.6)' : 'var(--accent)' }}>
                                    {plan.name}
                                </p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="font-display font-semibold text-5xl"
                                        style={{ color: plan.primary ? 'var(--white)' : 'var(--ink)', letterSpacing: '-2px' }}>
                                        {plan.price}
                                    </span>
                                    <span style={{ color: plan.primary ? 'rgba(255,255,255,0.6)' : 'var(--ink-dim)' }}>
                                        {plan.period}
                                    </span>
                                </div>
                                <p className="text-sm mb-6"
                                    style={{ color: plan.primary ? 'rgba(255,255,255,0.7)' : 'var(--ink-soft)' }}>
                                    {plan.desc}
                                </p>
                                <ul className="space-y-2 mb-8">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm"
                                            style={{ color: plan.primary ? 'rgba(255,255,255,0.85)' : 'var(--ink-soft)' }}>
                                            <span style={{ color: plan.primary ? 'rgba(255,255,255,0.5)' : 'var(--accent)' }}>✓</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register"
                                    className="block text-center font-semibold py-3 rounded-xl text-sm transition"
                                    style={{
                                        background: plan.primary ? 'var(--white)' : 'var(--accent)',
                                        color: plan.primary ? 'var(--accent)' : 'var(--white)',
                                    }}>
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="px-8 py-8 text-center"
                style={{ background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <LogoMark size={24} />
                    <span className="font-display font-semibold text-base" style={{ color: 'var(--white)' }}>
                        Local<span style={{ color: 'var(--accent-2)' }}>Flow</span>
                    </span>
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {t('footerTagline')} · © 2026
                </p>
            </footer>
        </main>
    )
}