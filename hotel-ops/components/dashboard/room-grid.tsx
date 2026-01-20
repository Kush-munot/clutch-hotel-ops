'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { BedDouble, Wrench, Sparkles, CheckCircle } from 'lucide-react'
import { RoomDetailModal } from './room-detail-modal'

interface Room {
    id: string
    room_number: string
    type: string
    status: 'available' | 'occupied' | 'cleaning' | 'maintenance'
    floor: number
    rate: number
    updated_at: string | null
    current_guest?: {
        name: string
        checkout_date: string
    }
}

interface RoomGridProps {
    hotelId: string
}

export function RoomGrid({ hotelId }: RoomGridProps) {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        // Initial fetch
        fetchRooms()

        // Subscribe to real-time changes
        const channel = supabase
            .channel('rooms-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'rooms',
                    filter: `hotel_id=eq.${hotelId}`,
                },
                (payload) => {
                    fetchRooms()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [hotelId])

    async function fetchRooms() {
        try {
            // Fetch all rooms
            const { data: allRooms, error: roomsError } = await supabase
                .from('rooms')
                .select('*')
                .eq('hotel_id', hotelId)
                .order('room_number', { ascending: true })

            if (roomsError) {
                console.error('Error fetching rooms:', roomsError)
                setLoading(false)
                return
            }

            // Fetch active bookings with guests
            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select('room_id, check_out, guests(name)')
                .eq('status', 'checked_in')
                .in('room_id', allRooms?.map(r => r.id) || [])

            if (bookingsError) {
                console.error('Error fetching bookings:', bookingsError)
            }

            // Combine rooms with guest info
            const roomsWithGuests = allRooms?.map((room) => {
                const booking = bookings?.find((b) => b.room_id === room.id)
                return {
                    ...room,
                    current_guest: booking
                        ? {
                            name: booking.guests?.name || 'Unknown',
                            checkout_date: booking.check_out,
                        }
                        : undefined,
                }
            }) || []

            setRooms(roomsWithGuests)
        } catch (err) {
            console.error('Unexpected error fetching rooms:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleRoomClick = (room: Room) => {
        setSelectedRoom(room)
        setModalOpen(true)
    }

    const handleStatusUpdate = (roomId: string, newStatus: string) => {
        // Optimistic update
        setRooms(prevRooms =>
            prevRooms.map(room =>
                room.id === roomId
                    ? { ...room, status: newStatus as Room['status'] }
                    : room
            )
        )
    }

    const getStatusConfig = (status: Room['status']) => {
        switch (status) {
            case 'available':
                return {
                    color: 'bg-green-500/10 border-green-500/20 hover:border-green-500/40',
                    badge: 'bg-green-500/20 text-green-400 border-green-500/30',
                    icon: CheckCircle,
                    iconColor: 'text-green-500',
                }
            case 'occupied':
                return {
                    color: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
                    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                    icon: BedDouble,
                    iconColor: 'text-blue-500',
                }
            case 'cleaning':
                return {
                    color: 'bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/40',
                    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                    icon: Sparkles,
                    iconColor: 'text-yellow-500',
                }
            case 'maintenance':
                return {
                    color: 'bg-red-500/10 border-red-500/20 hover:border-red-500/40',
                    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
                    icon: Wrench,
                    iconColor: 'text-red-500',
                }
        }
    }

    const filteredRooms = rooms.filter((room) => {
        if (filter === 'all') return true
        return room.status === filter
    })

    const statusCounts = {
        all: rooms.length,
        available: rooms.filter((r) => r.status === 'available').length,
        occupied: rooms.filter((r) => r.status === 'occupied').length,
        cleaning: rooms.filter((r) => r.status === 'cleaning').length,
        maintenance: rooms.filter((r) => r.status === 'maintenance').length,
    }

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 sm:h-32" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {Object.entries(statusCounts).map(([status, count]) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={cn(
                            'flex items-center gap-1.5 sm:gap-2 rounded-lg border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                            filter === status
                                ? 'border-green-500 bg-green-500/10 text-green-400'
                                : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-white'
                        )}
                    >
                        <span className="capitalize">{status}</span>
                        <Badge variant="outline" className="text-xs">
                            {count}
                        </Badge>
                    </button>
                ))}
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredRooms.map((room) => {
                    const config = getStatusConfig(room.status)
                    const Icon = config.icon

                    return (
                        <Card
                            key={room.id}
                            onClick={() => handleRoomClick(room)}
                            className={cn(
                                'cursor-pointer border transition-all hover:shadow-lg overflow-hidden',
                                config.color
                            )}
                        >
                            <CardHeader className="sm:pb-3 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base sm:text-lg font-bold text-white">
                                        {room.room_number}
                                    </CardTitle>
                                    <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', config.iconColor)} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-1.5 sm:space-y-2 pt-0 sm:p-6 sm:pt-0">
                                <div className="text-xs text-slate-400 capitalize">
                                    {room.type}
                                </div>
                                {room.current_guest && (
                                    <div className="rounded-lg bg-slate-800/50 p-1.5 sm:p-2">
                                        <p className="text-xs font-medium text-white truncate">
                                            {room.current_guest.name}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-slate-400">
                                            Until {new Date(room.current_guest.checkout_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                )}
                                <div className="text-[10px] sm:text-xs text-slate-500">
                                    Floor {room.floor} • ${room.rate}/night
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {filteredRooms.length === 0 && (
                <div className="flex h-64 items-center justify-center">
                    <p className="text-slate-400">No rooms found with status: {filter}</p>
                </div>
            )}
            <RoomDetailModal
                room={selectedRoom}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onStatusUpdate={handleStatusUpdate}
                hotelId={hotelId}
            />        </div>
    )
}
