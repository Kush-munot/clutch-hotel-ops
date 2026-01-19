'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { DashboardProvider } from './dashboard-provider'

export default function DashboardLayout({
    children,
}: {
    children: ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <DashboardProvider>
            {(userData) => (
                <div className="flex h-screen overflow-hidden">
                    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <Header
                            userName={userData.name}
                            userRole={userData.role}
                            hotelName={userData.hotels.name}
                            onMenuClick={() => setSidebarOpen(true)}
                        />
                        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6">
                            {children}
                        </main>
                    </div>
                </div>
            )}
        </DashboardProvider>
    )
}

