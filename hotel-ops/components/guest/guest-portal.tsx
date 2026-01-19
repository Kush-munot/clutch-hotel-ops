'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Clock, MapPin, CreditCard, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

interface GuestPortalProps {
    guest: any
}

export default function GuestPortal({ guest: initialGuest }: GuestPortalProps) {
    const [guest, setGuest] = useState(initialGuest)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Get active booking (if any)
    const activeBooking = guest?.bookings?.find((b: any) =>
        new Date(b.check_in) <= new Date() && new Date(b.check_out) >= new Date()
    )

    const upcomingBooking = guest?.bookings?.find((b: any) =>
        new Date(b.check_in) > new Date()
    )

    const handleCheckIn = async () => {
        if (!activeBooking) return

        setLoading(true)
        try {
            // Update room status to occupied
            const { error: roomError } = await supabase
                .from('rooms')
                .update({ status: 'occupied' })
                .eq('id', activeBooking.room_id)

            if (roomError) throw roomError

            // Update booking status
            const { error: bookingError } = await supabase
                .from('bookings')
                .update({ status: 'checked_in' })
                .eq('id', activeBooking.id)

            if (bookingError) throw bookingError

            // Log activity
            await supabase.from('activity_log').insert({
                hotel_id: activeBooking.hotel_id,
                user_id: guest.id,
                action_type: 'guest_checked_in',
                description: `${guest.first_name} ${guest.last_name} checked in`,
                related_room_id: activeBooking.room_id,
                related_booking_id: activeBooking.id
            })

            toast.success('Checked in successfully!')

            // Refresh data
            const { data: updatedGuest } = await supabase
                .from('guests')
                .select('*, bookings(*)')
                .eq('id', guest.id)
                .single()

            setGuest(updatedGuest)
        } catch (error) {
            console.error('Check-in error:', error)
            toast.error('Failed to check in')
        } finally {
            setLoading(false)
        }
    }

    const handleCheckOut = async () => {
        if (!activeBooking) return

        setLoading(true)
        try {
            // Update room status to cleaning
            const { error: roomError } = await supabase
                .from('rooms')
                .update({ status: 'cleaning' })
                .eq('id', activeBooking.room_id)

            if (roomError) throw roomError

            // Update booking status
            const { error: bookingError } = await supabase
                .from('bookings')
                .update({ status: 'checked_out' })
                .eq('id', activeBooking.id)

            if (bookingError) throw bookingError

            // Log activity
            await supabase.from('activity_log').insert({
                hotel_id: activeBooking.hotel_id,
                user_id: guest.id,
                action_type: 'guest_checked_out',
                description: `${guest.first_name} ${guest.last_name} checked out`,
                related_room_id: activeBooking.room_id,
                related_booking_id: activeBooking.id
            })

            toast.success('Checked out successfully!')

            // Refresh data
            const { data: updatedGuest } = await supabase
                .from('guests')
                .select('*, bookings(*)')
                .eq('id', guest.id)
                .single()

            setGuest(updatedGuest)
        } catch (error) {
            console.error('Check-out error:', error)
            toast.error('Failed to check out')
        } finally {
            setLoading(false)
        }
    }

    if (!guest) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>No Guest Profile</CardTitle>
                        <CardDescription>
                            You don't have a guest profile yet. Contact the hotel to create a booking.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 p-4">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">
                        Welcome, {guest.first_name}!
                    </h1>
                    <p className="text-slate-400">Manage your hotel stay</p>
                </div>

                {/* Active Booking */}
                {activeBooking && (
                    <Card className="border-green-500/20 bg-slate-900">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-green-400" />
                                        Current Stay
                                    </CardTitle>
                                    <CardDescription>Room {activeBooking.room?.room_number}</CardDescription>
                                </div>
                                <Badge variant={activeBooking.status === 'checked_in' ? 'default' : 'outline'}>
                                    {activeBooking.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Check-in</p>
                                        <p className="font-medium">
                                            {format(new Date(activeBooking.check_in), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Check-out</p>
                                        <p className="font-medium">
                                            {format(new Date(activeBooking.check_out), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Total Amount</p>
                                        <p className="font-medium">${activeBooking.total_amount}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Guests</p>
                                        <p className="font-medium">{activeBooking.number_of_guests}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                {activeBooking.status === 'confirmed' && (
                                    <Button
                                        onClick={handleCheckIn}
                                        disabled={loading}
                                        className="flex-1"
                                    >
                                        Check In
                                    </Button>
                                )}
                                {activeBooking.status === 'checked_in' && (
                                    <Button
                                        onClick={handleCheckOut}
                                        disabled={loading}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Check Out
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Upcoming Booking */}
                {upcomingBooking && !activeBooking && (
                    <Card className="border-blue-500/20 bg-slate-900">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-400" />
                                        Upcoming Stay
                                    </CardTitle>
                                    <CardDescription>Room {upcomingBooking.room?.room_number}</CardDescription>
                                </div>
                                <Badge variant="outline">{upcomingBooking.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <p className="text-slate-400">
                                    Check-in: <span className="text-white">
                                        {format(new Date(upcomingBooking.check_in), 'MMM d, yyyy')}
                                    </span>
                                </p>
                                <p className="text-slate-400">
                                    Check-out: <span className="text-white">
                                        {format(new Date(upcomingBooking.check_out), 'MMM d, yyyy')}
                                    </span>
                                </p>
                                <p className="text-slate-400">
                                    Total: <span className="text-white">${upcomingBooking.total_amount}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* No Bookings */}
                {!activeBooking && !upcomingBooking && (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Active Bookings</CardTitle>
                            <CardDescription>
                                You don't have any current or upcoming reservations.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {/* Guest Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                                <p className="text-slate-400">Email</p>
                                <p className="font-medium">{guest.email}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Phone</p>
                                <p className="font-medium">{guest.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
