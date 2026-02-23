import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Garantiza que el perfil existe antes de cualquier operación
export async function ensureProfile(userId: string, email: string) {
    const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

    if (!data) {
        await supabase
            .from('profiles')
            .insert({ id: userId, email })
    }
}