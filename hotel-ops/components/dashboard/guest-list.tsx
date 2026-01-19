'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, User, Mail, Phone, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface GuestListProps {
    guests: any[]
    hotelId: string
}

export default function GuestList({ guests }: GuestListProps) {
    const [search, setSearch] = useState('')

    const filteredGuests = guests.filter((guest) => {
        const searchLower = search.toLowerCase()
        return (
            guest.name?.toLowerCase().includes(searchLower) ||
            guest.email?.toLowerCase().includes(searchLower) ||
            guest.phone?.toLowerCase().includes(searchLower)
        )
    })

    const getGuestStatus = (guest: any) => {
        const activeBooking = guest.bookings?.find((b: any) =>
            new Date(b.check_in) <= new Date() && new Date(b.check_out) >= new Date()
        )

        if (activeBooking?.status === 'checked_in') return 'checked-in'
        if (activeBooking?.status === 'confirmed') return 'arriving-today'

        const upcomingBooking = guest.bookings?.find((b: any) =>
            new Date(b.check_in) > new Date()
        )

        if (upcomingBooking) return 'upcoming'
        return 'past-guest'
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'checked-in':
                return 'bg-green-500/10 text-green-400 border-green-500/20'
            case 'arriving-today':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'upcoming':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        }
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Guests</h1>
                <p className="text-slate-400 mt-2">Manage your hotel guests</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder="Search guests by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Total Guests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{guests.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Checked In
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            {guests.filter(g => getGuestStatus(g) === 'checked-in').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Arriving Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">
                            {guests.filter(g => getGuestStatus(g) === 'arriving-today').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Upcoming
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-400">
                            {guests.filter(g => getGuestStatus(g) === 'upcoming').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Guest List */}
            <div className="grid gap-4">
                {filteredGuests.map((guest) => {
                    const status = getGuestStatus(guest)
                    const activeBooking = guest.bookings?.find((b: any) =>
                        new Date(b.check_in) <= new Date() && new Date(b.check_out) >= new Date()
                    ) || guest.bookings?.[0]

                    return (
                        <Card key={guest.id} className="border-slate-800 bg-slate-900 hover:border-slate-600 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                                            <User className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-lg">
                                                        {guest.name}
                                                    </h3>
                                                    <Badge className={getStatusColor(status)}>
                                                        {status.replace('-', ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-4 w-4" />
                                                        {guest.email}
                                                    </div>
                                                    {guest.phone && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="h-4 w-4" />
                                                            {guest.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {activeBooking && (
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    <div className="flex items-center gap-1.5 text-slate-300">
                                                        <Calendar className="h-4 w-4 text-slate-400" />
                                                        <span>
                                                            {format(new Date(activeBooking.check_in), 'MMM d')} - {format(new Date(activeBooking.check_out), 'MMM d, yyyy')}
                                                        </span>
                                                    </div>
                                                    <div className="text-slate-400">
                                                        Room {activeBooking.rooms?.room_number}
                                                    </div>
                                                    <div className="text-slate-400">
                                                        ${activeBooking.total_amount}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {filteredGuests.length === 0 && (
                    <Card className="border-slate-800 bg-slate-900">
                        <CardContent className="flex h-32 items-center justify-center">
                            <p className="text-slate-400">No guests found</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
