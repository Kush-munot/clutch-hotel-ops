import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RoomManagement from '@/components/dashboard/room-management'

export const metadata: Metadata = {
    title: 'Rooms - HotelOps Live',
}

export default async function RoomsPage() {
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

    const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', userData.hotel_id)
        .order('room_number')

    return <RoomManagement rooms={rooms || []} hotelId={userData.hotel_id} />
}
