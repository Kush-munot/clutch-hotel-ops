'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BedDouble, User, Calendar, DollarSign, Sparkles, Wrench, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface RoomDetailModalProps {
    room: {
        id: string
        room_number: string
        type: string
        status: 'available' | 'occupied' | 'cleaning' | 'maintenance'
        floor: number
        rate: number
        current_guest?: {
            name: string
            checkout_date: string
        }
    } | null
    isOpen: boolean
    onClose: () => void
    onStatusUpdate: (roomId: string, newStatus: string) => void
    hotelId: string
}

export function RoomDetailModal({ room, isOpen, onClose, onStatusUpdate, hotelId }: RoomDetailModalProps) {
    const [updating, setUpdating] = useState(false)
    const supabase = createClient()

    if (!room) return null

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'occupied': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'cleaning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'maintenance': return 'bg-red-500/20 text-red-400 border-red-500/30'
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    const handleStatusUpdate = async (newStatus: string) => {
        setUpdating(true)

        try {
            const { error } = await supabase
                .from('rooms')
                .update({ status: newStatus })
                .eq('id', room.id)

            if (error) throw error

            // Log activity
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('activity_log').insert({
                    hotel_id: hotelId,
                    user_id: user.id,
                    action_type: 'room_status_changed',
                    description: `Room ${room.room_number} status changed to ${newStatus}`,
                    related_room_id: room.id
                })
            }

            toast.success(`Room ${room.room_number} marked as ${newStatus}`)
            onStatusUpdate(room.id, newStatus)
            onClose()
        } catch (error) {
            console.error('Error updating room status:', error)
            toast.error('Failed to update room status')
        } finally {
            setUpdating(false)
        }
    }

    const quickActions = [
        { status: 'available', label: 'Mark Available', icon: CheckCircle, color: 'bg-green-500 hover:bg-green-600' },
        { status: 'cleaning', label: 'Mark Cleaning', icon: Sparkles, color: 'bg-yellow-500 hover:bg-yellow-600' },
        { status: 'maintenance', label: 'Mark Maintenance', icon: Wrench, color: 'bg-red-500 hover:bg-red-600' },
    ].filter(action => action.status !== room.status)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold text-white">
                            Room {room.room_number}
                        </DialogTitle>
                        <Badge variant="outline" className={getStatusColor(room.status)}>
                            {room.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Room Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400">Room Type</p>
                            <p className="text-sm font-medium text-white capitalize">{room.type}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400">Floor</p>
                            <p className="text-sm font-medium text-white">Floor {room.floor}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400">Rate</p>
                            <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-green-400" />
                                <p className="text-sm font-medium text-white">${room.rate}/night</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400">Status</p>
                            <p className="text-sm font-medium text-white capitalize">{room.status}</p>
                        </div>
                    </div>

                    {/* Guest Information */}
                    {room.current_guest && (
                        <>
                            <Separator className="bg-slate-800" />
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-400" />
                                    <h3 className="text-sm font-semibold text-white">Current Guest</h3>
                                </div>
                                <div className="rounded-lg bg-slate-800/50 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-white">{room.current_guest.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Calendar className="h-3 w-3" />
                                        <span>Check-out: {new Date(room.current_guest.checkout_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Quick Actions */}
                    {room.status !== 'occupied' && quickActions.length > 0 && (
                        <>
                            <Separator className="bg-slate-800" />
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
                                <div className="grid gap-2">
                                    {quickActions.map(action => {
                                        const Icon = action.icon
                                        return (
                                            <Button
                                                key={action.status}
                                                onClick={() => handleStatusUpdate(action.status)}
                                                disabled={updating}
                                                className={`${action.color} text-white w-full justify-start`}
                                                size="sm"
                                            >
                                                <Icon className="h-4 w-4 mr-2" />
                                                {action.label}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {room.status === 'occupied' && (
                        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                            <p className="text-xs text-blue-400">
                                Room is currently occupied. Status updates are limited while a guest is checked in.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
