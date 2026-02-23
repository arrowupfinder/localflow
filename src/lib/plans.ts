export const PLANS = {
    free: {
        maxClients: 15,
        name: 'Free Forever',
    },
    growth: {
        maxClients: Infinity,
        name: 'Growth',
    },
}

// Por ahora todos los usuarios son plan free
// Cuando integres Stripe, aquí leerás el plan real del usuario
export async function getUserPlan() {
    return PLANS.free
}

export async function canAddClient(currentClientCount: number): Promise<{
    allowed: boolean
    reason?: string
    limit?: number
}> {
    const plan = await getUserPlan()
    if (currentClientCount >= plan.maxClients) {
        return {
            allowed: false,
            reason: 'limit_reached',
            limit: plan.maxClients,
        }
    }
    return { allowed: true }
}
