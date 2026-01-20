'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { X, Droplets, UtensilsCrossed, Sparkles, Wrench, Shirt, Plus } from 'lucide-react'

interface ServiceRequestFormProps {
    guestId: string
    bookingId: string
    roomId: string
    hotelId: string
    onClose: () => void
    onSuccess: () => void
}

const SERVICE_TYPES = [
    { value: 'housekeeping', label: 'Room Cleaning', icon: Sparkles, color: 'text-blue-500' },
    { value: 'amenities', label: 'Amenities (Towels, Water)', icon: Droplets, color: 'text-cyan-500' },
    { value: 'room_service', label: 'Room Service', icon: UtensilsCrossed, color: 'text-orange-500' },
    { value: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'text-red-500' },
    { value: 'other', label: 'Other', icon: Plus, color: 'text-gray-500' },
]

const PRIORITY_LEVELS = [
    { value: 'low', label: 'Low', color: 'border-green-500' },
    { value: 'normal', label: 'Normal', color: 'border-yellow-500' },
    { value: 'high', label: 'High', color: 'border-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'border-red-500' },
]

export default function ServiceRequestForm({
    guestId,
    bookingId,
    roomId,
    hotelId,
    onClose,
    onSuccess,
}: ServiceRequestFormProps) {
    const [requestType, setRequestType] = useState<string>('')
    const [priority, setPriority] = useState<string>('normal')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!requestType) {
            toast.error('Please select a service type')
            return
        }

        setLoading(true)

        try {
            // Create service request
            const { data: serviceData, error: requestError } = await supabase
                .from('service_requests')
                .insert({
                    guest_id: guestId,
                    booking_id: bookingId,
                    room_id: roomId,
                    type: requestType,
                    description: description.trim() || 'No additional details',
                    priority,
                    status: 'pending',
                })
                .select()

            console.log('Service request result:', { serviceData, requestError })

            if (requestError) {
                console.error('Service request error details:', requestError)
                throw requestError
            }

            // Create corresponding task for staff
            const { data: taskData, error: taskError } = await supabase
                .from('tasks')
                .insert({
                    hotel_id: hotelId,
                    room_id: roomId,
                    task_type: requestType === 'housekeeping' ? 'cleaning' : 'maintenance',
                    description: `Guest Request: ${SERVICE_TYPES.find(t => t.value === requestType)?.label}${description ? ` - ${description}` : ''}`,
                    priority: priority === 'urgent' || priority === 'high' ? 'high' : 'normal',
                    status: 'pending',
                })
                .select()

            console.log('Task result:', { taskData, taskError })

            if (taskError) {
                console.error('Task error details:', taskError)
                throw taskError
            }

            // Log activity
            const { error: activityError } = await supabase
                .from('activity_log')
                .insert({
                    hotel_id: hotelId,
                    action_type: 'service_request',
                    description: `Service request: ${SERVICE_TYPES.find(t => t.value === requestType)?.label}`,
                    room_id: roomId,
                })

            if (activityError) {
                console.error('Activity log error:', activityError)
                // Don't throw - activity log is not critical
            }

            toast.success('Service request submitted', {
                description: 'Our staff will attend to your request shortly',
            })

            onSuccess()
        } catch (error) {
            console.error('Error creating service request:', error)
            toast.error('Failed to submit request', {
                description: 'Please try again or contact the front desk',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8 overflow-y-auto">
            <div className="w-full max-w-lg my-8">
                <Card className="border-slate-800 bg-slate-900 max-h-[90vh] flex flex-col">
                    <CardHeader className="flex-shrink-0">
                        <div className="flex items-start justify-between pt-4 pb-4">
                            <div>
                                <CardTitle>Request Service</CardTitle>
                                <CardDescription>
                                    Select a service and we'll assist you promptly
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-y-auto flex-1">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Service Type Selection */}
                            <div className="space-y-3">
                                <Label>Service Type</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {SERVICE_TYPES.map((service) => {
                                        const Icon = service.icon
                                        return (
                                            <button
                                                key={service.value}
                                                type="button"
                                                onClick={() => setRequestType(service.value)}
                                                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all hover:bg-slate-800 ${requestType === service.value
                                                    ? 'border-green-500 bg-slate-800'
                                                    : 'border-slate-700'
                                                    }`}
                                            >
                                                <Icon className={`h-6 w-6 ${service.color}`} />
                                                <span className="text-sm font-medium">{service.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Priority Level */}
                            <div className="space-y-3">
                                <Label>Priority</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {PRIORITY_LEVELS.map((level) => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => setPriority(level.value)}
                                            className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${priority === level.value
                                                ? `${level.color} bg-slate-800`
                                                : 'border-slate-700 hover:bg-slate-800'
                                                }`}
                                        >
                                            {level.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Additional Details (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Any specific requirements or details..."
                                    rows={3}
                                    disabled={loading}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 sticky bottom-0 bg-slate-900">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1" disabled={loading || !requestType}>
                                    {loading ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
