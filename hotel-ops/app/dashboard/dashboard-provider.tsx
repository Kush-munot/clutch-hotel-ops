'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UserData {
    name: string
    role: string
    hotel_id: string
    hotels: {
        name: string
    }
}

interface DashboardProviderProps {
    children: (userData: UserData) => ReactNode
}

export function DashboardProvider({ children }: DashboardProviderProps) {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data } = await supabase
                .from('users')
                .select('*, hotels(*)')
                .eq('id', user.id)
                .single()

            if (!data || !data.hotels) {
                router.push('/login')
                return
            }

            setUserData(data)
            setLoading(false)
        }

        loadUser()
    }, [router, supabase])

    if (loading || !userData) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
                    <p className="mt-4 text-slate-400">Loading...</p>
                </div>
            </div>
        )
    }

    return <>{children(userData)}</>
}
