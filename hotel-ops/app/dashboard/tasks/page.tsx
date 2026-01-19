import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TaskList from '@/components/dashboard/task-list'

export const metadata: Metadata = {
    title: 'Tasks - HotelOps Live',
}

export default async function TasksPage() {
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

    // Get rooms that need cleaning or maintenance
    const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', userData.hotel_id)
        .in('status', ['cleaning', 'maintenance'])
        .order('floor')

    return <TaskList rooms={rooms || []} hotelId={userData.hotel_id} />
}
