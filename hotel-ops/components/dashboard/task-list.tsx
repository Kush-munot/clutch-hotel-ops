'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, Wrench, Home, BellRing, User } from 'lucide-react'
import { format } from 'date-fns'

interface TaskListProps {
    rooms: any[]
    hotelId: string
}

interface ServiceRequest {
    id: string
    type: string
    description: string
    priority: string
    status: string
    created_at: string
    room_id: string
    guest_id: string
    guests: {
        name: string
    }
    rooms: {
        room_number: string
        hotel_id: string
    }
}

export default function TaskList({ rooms: initialRooms, hotelId }: TaskListProps) {
    const [rooms, setRooms] = useState(initialRooms)
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
    const [completing, setCompleting] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        loadServiceRequests()

        // Subscribe to service requests
        const channel = supabase
            .channel('service-requests')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'service_requests' },
                () => {
                    loadServiceRequests()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [hotelId])

    const loadServiceRequests = async () => {
        const { data, error } = await supabase
            .from('service_requests')
            .select('*, guests(name), rooms(room_number, hotel_id)')
            .in('status', ['pending', 'in_progress'])
            .order('created_at', { ascending: false })


        if (!error && data) {
            // Filter by hotel_id from rooms
            const filteredRequests = data.filter(req => req.rooms?.hotel_id === hotelId)
            setServiceRequests(filteredRequests)
        }
    }

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

    const handleCompleteServiceRequest = async (request: ServiceRequest) => {
        setCompleting(request.id)
        try {
            const { error } = await supabase
                .from('service_requests')
                .update({ status: 'completed' })
                .eq('id', request.id)

            if (error) throw error

            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('activity_log').insert({
                    hotel_id: hotelId,
                    user_id: user.id,
                    action_type: 'service_completed',
                    description: `Service request completed: ${request.type.replace('_', ' ')} for room ${request.rooms.room_number}`,
                    room_id: request.room_id
                })
            }

            setServiceRequests(serviceRequests.filter(r => r.id !== request.id))
            toast.success('Service request completed')
        } catch (error) {
            console.error('Error completing service request:', error)
            toast.error('Failed to complete request')
        } finally {
            setCompleting(null)
        }
    }

    const handleStartServiceRequest = async (request: ServiceRequest) => {
        try {
            const { error } = await supabase
                .from('service_requests')
                .update({ status: 'in_progress' })
                .eq('id', request.id)

            if (error) throw error

            toast.success('Service request started')
            loadServiceRequests()
        } catch (error) {
            console.error('Error starting service request:', error)
            toast.error('Failed to start request')
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500'
            case 'high': return 'bg-orange-500'
            case 'medium': return 'bg-yellow-500'
            case 'low': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    const cleaningRooms = rooms.filter(r => r.status === 'cleaning')
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance')
    const pendingRequests = serviceRequests.filter(r => r.status === 'pending')
    const inProgressRequests = serviceRequests.filter(r => r.status === 'in_progress')

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Tasks & Service Requests</h1>
                <p className="text-slate-400 mt-2">Manage cleaning, maintenance, and guest requests</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Total Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{rooms.length + serviceRequests.length}</div>
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
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Guest Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">{serviceRequests.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Service Requests */}
            {pendingRequests.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <BellRing className="h-5 w-5 text-blue-400" />
                        Pending Guest Requests
                    </h2>
                    <div className="grid gap-3">
                        {pendingRequests.map((request) => (
                            <Card key={request.id} className="border-blue-500/20 border-slate-800 bg-slate-900">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                                <BellRing className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold capitalize">
                                                        {request.type.replace('_', ' ')}
                                                    </h3>
                                                    <Badge className={`${getPriorityColor(request.priority)} capitalize`}>
                                                        {request.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-400">
                                                    Room {request.rooms.room_number} • {request.guests.name}
                                                </p>
                                                {request.description && (
                                                    <p className="text-sm text-slate-500 mt-1">{request.description}</p>
                                                )}
                                                <p className="text-xs text-slate-600 mt-1">
                                                    {format(new Date(request.created_at), 'PPp')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleStartServiceRequest(request)}
                                            >
                                                Start
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleCompleteServiceRequest(request)}
                                                disabled={completing === request.id}
                                                className="bg-blue-500 hover:bg-blue-600"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Complete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* In Progress Service Requests */}
            {inProgressRequests.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-green-400" />
                        In Progress
                    </h2>
                    <div className="grid gap-3">
                        {inProgressRequests.map((request) => (
                            <Card key={request.id} className="border-green-500/20 border-slate-800 bg-slate-900">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                                <User className="h-5 w-5 text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold capitalize">
                                                        {request.type.replace('_', ' ')}
                                                    </h3>
                                                    <Badge className="bg-green-500">In Progress</Badge>
                                                </div>
                                                <p className="text-sm text-slate-400">
                                                    Room {request.rooms.room_number} • {request.guests.name}
                                                </p>
                                                {request.description && (
                                                    <p className="text-sm text-slate-500 mt-1">{request.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleCompleteServiceRequest(request)}
                                            disabled={completing === request.id}
                                            className="bg-green-500 hover:bg-green-600"
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

            {/* No Tasks */}
            {rooms.length === 0 && serviceRequests.length === 0 && (
                <Card className="border-slate-800 bg-slate-900">
                    <CardContent className="py-12 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                        <p className="text-slate-400">No pending tasks or service requests</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
