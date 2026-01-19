import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Analytics from '@/components/dashboard/analytics'

export const metadata: Metadata = {
    title: 'Analytics - HotelOps Live',
}

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: userData } = await supabase
        .from('users')
        .select('hotel_id')
        .eq('id', user.id)
        .single()

    if (!userData?.hotel_id) {
        redirect('/login')
    }

    // Get analytics data
    const [roomsData, bookingsData] = await Promise.all([
        supabase.from('rooms').select('*').eq('hotel_id', userData.hotel_id),
        supabase.from('bookings').select('*').eq('hotel_id', userData.hotel_id)
    ])

    return <Analytics rooms={roomsData.data || []} bookings={bookingsData.data || []} />
}
