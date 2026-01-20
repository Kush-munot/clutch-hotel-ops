'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Building2, Calendar, DoorOpen, LogOut, Loader2, BellRing } from 'lucide-react'
import { format } from 'date-fns'
import ServiceRequestForm from '@/components/guest/service-request-form'

interface GuestSession {
    guest_id: string
    guest_code: string
    name: string
}

interface Booking {
    id: string
    room_id: string
    check_in: string
    check_out: string
    status: string
    rooms: {
        room_number: string
        type: string
        hotel_id: string
    }
}

interface ServiceRequest {
    id: string
    type: string
    description: string
    priority: string
    status: string
    created_at: string
}

export default function GuestPortalPage() {
    const [loading, setLoading] = useState(true)
    const [guest, setGuest] = useState<GuestSession | null>(null)
    const [activeBooking, setActiveBooking] = useState<Booking | null>(null)
    const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null)
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
    const [showRequestForm, setShowRequestForm] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        loadGuestData()
    }, [])

    const loadGuestData = async () => {
        try {
            // Get guest session from localStorage
            const sessionData = localStorage.getItem('guest_session')
            if (!sessionData) {
                router.push('/login')
                return
            }

            const guestSession: GuestSession = JSON.parse(sessionData)
            setGuest(guestSession)

            // Load bookings
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select('*, rooms(room_number, type, hotel_id)')
                .eq('guest_id', guestSession.guest_id)
                .order('check_in', { ascending: false })

            console.log('Bookings data:', { bookings, error, guest_id: guestSession.guest_id })

            if (error) {
                console.error('Bookings error:', error)
                throw error
            }

            const now = new Date()
            const active = bookings?.find(b =>
                new Date(b.check_in) <= now && new Date(b.check_out) >= now && b.status === 'checked_in'
            )
            const upcoming = bookings?.find(b =>
                new Date(b.check_in) > now && b.status === 'confirmed'
            )

            console.log('Booking status:', { active, upcoming, now, bookingsCount: bookings?.length })

            setActiveBooking(active || null)
            setUpcomingBooking(upcoming || null)

            // Load service requests
            if (active) {
                await loadServiceRequests(guestSession.guest_id)
            }

            setLoading(false)
        } catch (error) {
            console.error('Error loading guest data:', error)
            toast.error('Failed to load guest information')
            setLoading(false)
        }
    }

    const loadServiceRequests = async (guestId: string) => {
        const { data, error } = await supabase
            .from('service_requests')
            .select('*')
            .eq('guest_id', guestId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setServiceRequests(data)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('guest_session')
        toast.success('Logged out successfully')
        router.push('/login')
    }

    const handleCheckOut = async () => {
        if (!activeBooking) return

        const { error } = await supabase
            .from('bookings')
            .update({ status: 'checked_out' })
            .eq('id', activeBooking.id)

        if (error) {
            toast.error('Failed to check out')
        } else {
            toast.success('Checked out successfully')
            setActiveBooking(null)
            loadGuestData()
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500'
            case 'in_progress': return 'bg-blue-500'
            case 'completed': return 'bg-green-500'
            case 'cancelled': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-black">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black p-4 md:p-8">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-green-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-white">Guest Portal</h1>
                            <p className="text-sm text-slate-400">Welcome, {guest?.name}</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>

                {/* Active Booking */}
                {activeBooking && activeBooking.rooms && (
                    <Card className="border-slate-800 bg-slate-900 p-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DoorOpen className="h-5 w-5 text-green-500" />
                                Current Stay
                            </CardTitle>
                            <CardDescription>Room {activeBooking.rooms.room_number}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-slate-400">Check-in</p>
                                    <p className="font-medium">{format(new Date(activeBooking.check_in), 'PPP')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Check-out</p>
                                    <p className="font-medium">{format(new Date(activeBooking.check_out), 'PPP')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Room Type</p>
                                    <p className="font-medium capitalize">{activeBooking.rooms.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Status</p>
                                    <Badge className="bg-green-500">Checked In</Badge>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowRequestForm(true)}
                                    className="flex-1"
                                >
                                    <BellRing className="mr-2 h-4 w-4" />
                                    Request Service
                                </Button>
                                <Button variant="outline" onClick={handleCheckOut}>
                                    Check Out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Upcoming Booking */}
                {upcomingBooking && !activeBooking && upcomingBooking.rooms && (
                    <Card className="border-slate-800 bg-slate-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                Upcoming Booking
                            </CardTitle>
                            <CardDescription>Room {upcomingBooking.rooms.room_number}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-slate-400">Check-in</p>
                                    <p className="font-medium">{format(new Date(upcomingBooking.check_in), 'PPP')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Check-out</p>
                                    <p className="font-medium">{format(new Date(upcomingBooking.check_out), 'PPP')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Room Type</p>
                                    <p className="font-medium capitalize">{upcomingBooking.rooms.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Status</p>
                                    <Badge className="bg-blue-500">Confirmed</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* No Booking */}
                {!activeBooking && !upcomingBooking && (
                    <Card className="border-slate-800 bg-slate-900">
                        <CardContent className="py-8 text-center">
                            <p className="text-slate-400">No active or upcoming bookings</p>
                        </CardContent>
                    </Card>
                )}

                {/* Service Requests */}
                {activeBooking && serviceRequests.length > 0 && (
                    <Card className="border-slate-800 bg-slate-900">
                        <CardHeader>
                            <CardTitle>Your Service Requests</CardTitle>
                            <CardDescription>Track your requests and their status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {serviceRequests.map((request) => (
                                    <div key={request.id} className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
                                        <div className="flex-1">
                                            <p className="font-medium capitalize">{request.type.replace('_', ' ')}</p>
                                            {request.description && (
                                                <p className="text-sm text-slate-400">{request.description}</p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-1">
                                                {format(new Date(request.created_at), 'PPp')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`capitalize ${getStatusColor(request.status)}`}>
                                                {request.status.replace('_', ' ')}
                                            </Badge>
                                            {request.priority === 'urgent' && (
                                                <Badge variant="destructive">Urgent</Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Service Request Form */}
                {showRequestForm && activeBooking && guest && (
                    <ServiceRequestForm
                        guestId={guest.guest_id}
                        bookingId={activeBooking.id}
                        roomId={activeBooking.room_id}
                        hotelId={activeBooking.rooms.hotel_id}
                        onClose={() => setShowRequestForm(false)}
                        onSuccess={() => {
                            setShowRequestForm(false)
                            loadServiceRequests(guest.guest_id)
                        }}
                    />
                )}
            </div>
        </div>
    )
}
