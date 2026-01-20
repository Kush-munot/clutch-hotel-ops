'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Bed, DollarSign, Home, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoomManagementProps {
    rooms: any[]
    hotelId: string
}

export default function RoomManagement({ rooms: initialRooms, hotelId }: RoomManagementProps) {
    const [rooms, setRooms] = useState(initialRooms)
    const [filter, setFilter] = useState<'all' | number>('all')
    const supabase = createClient()

    const floors = [...new Set(rooms.map(r => r.floor))].sort()

    const filteredRooms = rooms.filter((room) => {
        if (filter === 'all') return true
        return room.floor === filter
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-500/10 text-green-400 border-green-500/20'
            case 'occupied':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'cleaning':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            case 'maintenance':
                return 'bg-red-500/10 text-red-400 border-red-500/20'
            default:
                return ''
        }
    }

    const handleStatusChange = async (roomId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('rooms')
                .update({ status: newStatus })
                .eq('id', roomId)

            if (error) {
                console.error('Error updating room status:', error)
                throw error
            }

            setRooms(rooms.map(r => r.id === roomId ? { ...r, status: newStatus } : r))

            // Activity logging is handled automatically by database trigger
            toast.success('Room status updated')
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error((error as any)?.message || 'Failed to update status')
        }
    }

    const statusCounts = {
        all: rooms.length,
        available: rooms.filter(r => r.status === 'available').length,
        occupied: rooms.filter(r => r.status === 'occupied').length,
        cleaning: rooms.filter(r => r.status === 'cleaning').length,
        maintenance: rooms.filter(r => r.status === 'maintenance').length,
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Room Management</h1>
                <p className="text-slate-400 mt-2">Manage all hotel rooms</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Bed className="h-4 w-4" />
                            Total Rooms
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{statusCounts.all}</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">{statusCounts.available}</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">Occupied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">{statusCounts.occupied}</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-400">{statusCounts.maintenance}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Floor Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilter('all')}
                    className={cn(
                        'px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap',
                        filter === 'all'
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                    )}
                >
                    All Floors
                </button>
                {floors.map((floor) => (
                    <button
                        key={floor}
                        onClick={() => setFilter(floor)}
                        className={cn(
                            'px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap',
                            filter === floor
                                ? 'border-green-500 bg-green-500/10 text-green-400'
                                : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                        )}
                    >
                        Floor {floor}
                    </button>
                ))}
            </div>

            {/* Room List */}
            <div className="grid gap-4">
                {filteredRooms.length === 0 ? (
                    <Card className="border-slate-800 bg-slate-900">
                        <CardContent className="flex h-32 items-center justify-center">
                            <p className="text-slate-400">No rooms found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredRooms.map((room) => (
                        <Card key={room.id} className="border-slate-800 bg-slate-900 hover:border-slate-600 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800">
                                            <Home className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-lg">Room {room.room_number}</h3>
                                                    <Badge className={getStatusColor(room.status)}>
                                                        {room.status}
                                                    </Badge>
                                                    <Badge variant="outline" className="capitalize">
                                                        {room.type}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Home className="h-4 w-4" />
                                                        Floor {room.floor}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <DollarSign className="h-4 w-4" />
                                                        ${room.rate}/night
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {room.status !== 'available' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(room.id, 'available')}
                                                        className="text-green-400 border-green-500/50 hover:bg-green-500/20 hover:border-green-500"
                                                    >
                                                        Mark Available
                                                    </Button>
                                                )}
                                                {room.status !== 'cleaning' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(room.id, 'cleaning')}
                                                        className="text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/20 hover:border-yellow-500"
                                                    >
                                                        Mark Cleaning
                                                    </Button>
                                                )}
                                                {room.status !== 'maintenance' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(room.id, 'maintenance')}
                                                        className="text-red-400 border-red-500/50 hover:bg-red-500/20 hover:border-red-500"
                                                    >
                                                        <Wrench className="h-3 w-3 mr-1" />
                                                        Maintenance
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
