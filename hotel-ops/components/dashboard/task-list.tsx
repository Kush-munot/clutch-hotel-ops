'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, Wrench, Home } from 'lucide-react'

interface TaskListProps {
    rooms: any[]
    hotelId: string
}

export default function TaskList({ rooms: initialRooms, hotelId }: TaskListProps) {
    const [rooms, setRooms] = useState(initialRooms)
    const [completing, setCompleting] = useState<string | null>(null)
    const supabase = createClient()

    const handleCompleteTask = async (room: any) => {
        setCompleting(room.id)
        try {
            const { error } = await supabase
                .from('rooms')
                .update({ status: 'available' })
                .eq('id', room.id)

            if (error) throw error

            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('activity_log').insert({
                    hotel_id: hotelId,
                    user_id: user.id,
                    action_type: room.status === 'cleaning' ? 'cleaning_completed' : 'maintenance_completed',
                    description: `${room.status === 'cleaning' ? 'Cleaning' : 'Maintenance'} completed for room ${room.room_number}`,
                    related_room_id: room.id
                })
            }

            setRooms(rooms.filter(r => r.id !== room.id))
            toast.success(`Room ${room.room_number} marked as available`)
        } catch (error) {
            console.error('Error completing task:', error)
            toast.error('Failed to complete task')
        } finally {
            setCompleting(null)
        }
    }

    const cleaningRooms = rooms.filter(r => r.status === 'cleaning')
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance')

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Housekeeping Tasks</h1>
                <p className="text-slate-400 mt-2">Manage cleaning and maintenance tasks</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Total Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{rooms.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Cleaning
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">{cleaningRooms.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Maintenance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-400">{maintenanceRooms.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Cleaning Tasks */}
            {cleaningRooms.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                        Cleaning Required
                    </h2>
                    <div className="grid gap-3">
                        {cleaningRooms.map((room) => (
                            <Card key={room.id} className="border-yellow-500/20 border-slate-800 bg-slate-900">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                                                <Home className="h-5 w-5 text-yellow-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Room {room.room_number}</h3>
                                                <p className="text-sm text-slate-400">
                                                    Floor {room.floor} • {room.type}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleCompleteTask(room)}
                                            disabled={completing === room.id}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-black"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Complete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Maintenance Tasks */}
            {maintenanceRooms.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-red-400" />
                        Maintenance Required
                    </h2>
                    <div className="grid gap-3">
                        {maintenanceRooms.map((room) => (
                            <Card key={room.id} className="border-red-500/20 border-slate-800 bg-slate-900">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                                                <Wrench className="h-5 w-5 text-red-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Room {room.room_number}</h3>
                                                <p className="text-sm text-slate-400">
                                                    Floor {room.floor} • {room.type}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleCompleteTask(room)}
                                            disabled={completing === room.id}
                                            className="bg-red-500 hover:bg-red-600"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Complete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {rooms.length === 0 && (
                <Card className="border-slate-800 bg-slate-900">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">All Tasks Complete!</h3>
                        <p className="text-slate-400">No rooms require cleaning or maintenance</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
