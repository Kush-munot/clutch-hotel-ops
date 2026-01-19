import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuestList from '@/components/dashboard/guest-list'

export const metadata: Metadata = {
    title: 'Guests - HotelOps Live',
}

export default async function GuestsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile to get hotel_id
    const { data: userData } = await supabase
        .from('users')
        .select('hotel_id')
        .eq('id', user.id)
        .single()

    if (!userData?.hotel_id) {
        redirect('/login')
    }

    // Get all guests with their bookings
    const { data: guests } = await supabase
        .from('guests')
        .select(`
            *,
            bookings (
                id,
                room_id,
                check_in,
                check_out,
                status,
                total_amount,
                rooms (
                    room_number,
                    type
                )
            )
        `)
        .eq('bookings.hotel_id', userData.hotel_id)
        .order('created_at', { ascending: false })

    return <GuestList guests={guests || []} hotelId={userData.hotel_id} />
}
