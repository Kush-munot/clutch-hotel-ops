import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuestPortal from '@/components/guest/guest-portal'

export default async function GuestPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if this is a guest user (no staff profile)
    const { data: staff } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (staff) {
        // Staff should use the dashboard
        redirect('/dashboard')
    }

    // Get guest info and active booking
    const { data: guest } = await supabase
        .from('guests')
        .select('*, bookings(*)')
        .eq('email', user.email)
        .single()

    return <GuestPortal guest={guest} />
}
