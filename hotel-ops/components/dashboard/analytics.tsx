'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Users, Bed } from 'lucide-react'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

interface AnalyticsProps {
    rooms: any[]
    bookings: any[]
}

export default function Analytics({ rooms, bookings }: AnalyticsProps) {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Current month bookings
    const currentMonthBookings = bookings.filter(b => {
        const checkIn = new Date(b.check_in)
        return isWithinInterval(checkIn, { start: monthStart, end: monthEnd })
    })

    // Revenue calculations
    const totalRevenue = currentMonthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    const averageRate = rooms.reduce((sum, r) => sum + r.rate, 0) / rooms.length

    // Occupancy calculations
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length
    const occupancyRate = ((occupiedRooms / rooms.length) * 100).toFixed(1)

    // Active guests
    const activeGuests = currentMonthBookings.filter(b =>
        b.status === 'checked_in' || b.status === 'confirmed'
    ).length

    // Revenue by room type
    const revenueByType = rooms.reduce((acc, room) => {
        const roomBookings = bookings.filter(b => b.room_id === room.id)
        const revenue = roomBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
        acc[room.type] = (acc[room.type] || 0) + revenue
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-slate-400 mt-2">
                    {format(now, 'MMMM yyyy')} Performance Overview
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Monthly Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            ${totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {currentMonthBookings.length} bookings this month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Occupancy Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">
                            {occupancyRate}%
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {occupiedRooms} of {rooms.length} rooms occupied
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Active Guests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-400">
                            {activeGuests}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Currently in hotel
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Bed className="h-4 w-4" />
                            Avg. Room Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            ${averageRate.toFixed(0)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Per night
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue by Room Type */}
            <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                    <CardTitle>Revenue by Room Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(revenueByType).map(([type, revenue]) => {
                            const typeRooms = rooms.filter(r => r.type === type)
                            const percentage = ((revenue / totalRevenue) * 100).toFixed(1)
                            return (
                                <div key={type}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium capitalize">{type}</span>
                                            <span className="text-sm text-slate-400">
                                                ({typeRooms.length} rooms)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">${revenue.toLocaleString()}</span>
                                            <span className="text-sm text-slate-400">{percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Room Status Distribution */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader>
                        <CardTitle>Room Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {['available', 'occupied', 'cleaning', 'maintenance'].map(status => {
                                const count = rooms.filter(r => r.status === status).length
                                const percentage = ((count / rooms.length) * 100).toFixed(0)
                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <span className="capitalize text-sm">{status}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${status === 'available' ? 'bg-green-500' :
                                                        status === 'occupied' ? 'bg-blue-500' :
                                                            status === 'cleaning' ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                        }`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-12 text-right">
                                                {count} ({percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader>
                        <CardTitle>Booking Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {['confirmed', 'checked_in', 'checked_out', 'cancelled'].map(status => {
                                const count = bookings.filter(b => b.status === status).length
                                const percentage = bookings.length > 0 ? ((count / bookings.length) * 100).toFixed(0) : 0
                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <span className="capitalize text-sm">{status.replace('_', ' ')}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${status === 'confirmed' ? 'bg-purple-500' :
                                                        status === 'checked_in' ? 'bg-green-500' :
                                                            status === 'checked_out' ? 'bg-slate-500' :
                                                                'bg-red-500'
                                                        }`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-12 text-right">
                                                {count} ({percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
