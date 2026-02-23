'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

export default function LocaleSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    function switchLocale() {
        const next = locale === 'en' ? 'es' : 'en'
        // Reemplaza solo el segmento de locale en la URL actual
        const newPath = pathname.replace(`/${locale}`, `/${next}`)
        router.push(newPath)
    }

    return (
        <button
            onClick={switchLocale}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            style={{
                background: 'var(--paper-2)',
                color: 'var(--ink-soft)',
                border: '1px solid var(--border)'
            }}
            title={locale === 'en' ? 'Cambiar a Español' : 'Switch to English'}
        >
            <span>{locale === 'en' ? '🇪🇸' : '🇺🇸'}</span>
            <span>{locale === 'en' ? 'ES' : 'EN'}</span>
        </button>
    )
}
