'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Building2,
    ClipboardList,
    Users,
    Settings,
    BarChart3,
    X
} from 'lucide-react'

const menuItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Rooms',
        href: '/dashboard/rooms',
        icon: Building2,
    },
    {
        title: 'Tasks',
        href: '/dashboard/tasks',
        icon: ClipboardList,
    },
    {
        title: 'Guests',
        href: '/dashboard/guests',
        icon: Users,
    },
    {
        title: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
]

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    'fixed lg:static inset-y-0 left-0 z-50 flex h-full w-40 flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-green-500" />
                        <span className="text-lg font-bold text-white">HotelOps Live</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    // Close sidebar on mobile after clicking
                                    if (window.innerWidth < 1024) {
                                        onClose()
                                    }
                                }}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-green-500/10 text-green-500'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-slate-800 p-4">
                    <div className="text-xs text-slate-500">
                        <p>Version 1.0.0</p>
                        <p className="mt-1">© 2026 HotelOps</p>
                    </div>
                </div>
            </div>
        </>
    )
}
