import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Settings from '@/components/dashboard/settings'

export const metadata: Metadata = {
    title: 'Settings - HotelOps Live',
}

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: userData } = await supabase
        .from('users')
        .select('*, hotels(*)')
        .eq('id', user.id)
        .single()

    if (!userData?.hotel_id) {
        redirect('/login')
    }

    return <Settings user={user} userData={userData} hotel={userData.hotels} />
}
