'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LogOut, User, Moon, Sun, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'

interface HeaderProps {
    userName: string
    userRole: string
    hotelName: string
    onMenuClick: () => void
}

export function Header({ userName, userRole, hotelName, onMenuClick }: HeaderProps) {
    const router = useRouter()
    const supabase = createClient()
    const { theme, setTheme } = useTheme()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6 backdrop-blur-sm">
            {/* Hotel Info */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-sm font-semibold text-white">{hotelName}</h1>
                    <p className="text-xs text-slate-400">Real-time Operations Dashboard</p>
                </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                    {theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </button>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-800">
                        <div className="text-right">
                            <p className="text-sm font-medium text-white">{userName}</p>
                            <Badge variant="outline" className="text-xs">
                                {userRole}
                            </Badge>
                        </div>
                        <Avatar>
                            <AvatarFallback className="bg-green-500 text-white">
                                {getInitials(userName)}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
