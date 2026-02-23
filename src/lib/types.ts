export type Profile = {
    id: string
    business_name: string | null
    email: string | null
    phone: string | null
    locale: string
    created_at: string
}

export type Client = {
    id: string
    user_id: string
    name: string
    email: string | null
    phone: string | null
    notes: string | null
    created_at: string
}

export type Appointment = {
    id: string
    user_id: string
    client_id: string
    service: string
    date: string
    time: string
    status: 'pending' | 'confirmed' | 'cancelled'
    notes: string | null
    created_at: string
    clients?: Client
}

export type Invoice = {
    id: string
    user_id: string
    client_id: string
    amount: number
    description: string | null
    status: 'unpaid' | 'paid'
    due_date: string | null
    created_at: string
    clients?: Client
}