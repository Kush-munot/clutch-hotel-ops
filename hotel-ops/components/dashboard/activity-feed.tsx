'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { Activity, UserPlus, BedDouble, Wrench, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityLog {
    id: string
    action_type: string
    description: string
    timestamp: string
    user_id: string | null
    users?: {
        name: string
    }
}

interface ActivityFeedProps {
    hotelId: string
}

export function ActivityFeed({ hotelId }: ActivityFeedProps) {
    const [activities, setActivities] = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(true)
    const [isLive, setIsLive] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        // Initial fetch
        fetchActivities()

        // Subscribe to real-time changes
        const channel = supabase
            .channel('activity-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activity_log',
                    filter: `hotel_id=eq.${hotelId}`,
                },
                (payload) => {
                    console.log('New activity:', payload)
                    handleNewActivity(payload.new as ActivityLog)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [hotelId])

    async function fetchActivities() {
        try {
            // Fetch activities
            const { data: activitiesData, error: activitiesError } = await supabase
                .from('activity_log')
                .select('*')
                .eq('hotel_id', hotelId)
                .order('timestamp', { ascending: false })
                .limit(50)

            if (activitiesError) {
                console.error('Error fetching activities:', activitiesError)
                setLoading(false)
                return
            }

            // Fetch user names separately if needed
            const userIds = [...new Set(activitiesData?.map(a => a.user_id).filter(Boolean) || [])]

            let usersMap: Record<string, { name: string }> = {}
            if (userIds.length > 0) {
                const { data: usersData } = await supabase
                    .from('users')
                    .select('id, name')
                    .in('id', userIds)

                if (usersData) {
                    usersMap = Object.fromEntries(usersData.map(u => [u.id, { name: u.name }]))
                }
            }

            // Combine activities with user names
            const activitiesWithUsers = activitiesData?.map(activity => ({
                ...activity,
                users: activity.user_id ? usersMap[activity.user_id] : undefined
            })) || []

            setActivities(activitiesWithUsers)
        } catch (err) {
            console.error('Unexpected error fetching activities:', err)
        } finally {
            setLoading(false)
        }
    }

    function handleNewActivity(newActivity: ActivityLog) {
        setActivities((prev) => [newActivity, ...prev].slice(0, 50))

        // Auto-scroll to top if live mode is enabled
        if (isLive && scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const getActionIcon = (action: string) => {
        if (action.includes('check')) return BedDouble
        if (action.includes('guest') || action.includes('user')) return UserPlus
        if (action.includes('maintenance')) return Wrench
        if (action.includes('clean')) return CheckCircle
        if (action.includes('error') || action.includes('alert')) return AlertCircle
        return Activity
    }

    const getActionColor = (action: string) => {
        if (action.includes('check-in') || action.includes('clean')) return 'text-green-400'
        if (action.includes('check-out')) return 'text-blue-400'
        if (action.includes('maintenance')) return 'text-red-400'
        if (action.includes('error') || action.includes('alert')) return 'text-yellow-400'
        return 'text-slate-400'
    }

    if (loading) {
        return (
            <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Live Activity Feed
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                    ))}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                        <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Live Activity Feed</span>
                        <span className="sm:hidden">Activity</span>
                    </CardTitle>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Badge
                            variant={isLive ? 'default' : 'outline'}
                            className={cn('text-xs', isLive ? 'bg-green-500 text-white' : '')}
                        >
                            <span className={isLive ? 'mr-1 inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 animate-pulse rounded-full bg-white' : ''}>
                                {isLive ? '●' : '○'}
                            </span>
                            {isLive ? 'Live' : 'Paused'}
                        </Badge>
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className="text-[10px] sm:text-xs text-slate-400 hover:text-white hidden sm:inline"
                        >
                            {isLive ? 'Pause' : 'Resume'}
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
                <ScrollArea className="h-[300px] sm:h-[400px]" ref={scrollRef}>
                    <div className="space-y-2 sm:space-y-4 pr-4">
                        {activities.length === 0 ? (
                            <div className="flex h-64 items-center justify-center">
                                <p className="text-xs sm:text-sm text-slate-400">No recent activity</p>
                            </div>
                        ) : (
                            activities.map((activity) => {
                                const Icon = getActionIcon(activity.action_type)
                                const color = getActionColor(activity.action_type)

                                return (
                                    <div
                                        key={activity.id}
                                        className="flex gap-2 sm:gap-3 rounded-lg border border-slate-800 bg-slate-950 p-2 sm:p-3 transition-colors hover:border-slate-700 w-full"
                                    >
                                        <div className={`mt-0.5 sm:mt-1 flex-shrink-0 ${color}`}>
                                            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        </div>
                                        <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0 max-w-full">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-xs sm:text-sm font-medium text-white truncate">
                                                    {activity.action_type.replace(/_/g, ' ')}
                                                </p>
                                                <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap flex-shrink-0">
                                                    {formatDistanceToNow(new Date(activity.timestamp), {
                                                        addSuffix: true,
                                                    }).replace('about ', '')}
                                                </span>
                                            </div>
                                            <p className="text-[10px] sm:text-xs text-slate-400 break-words pr-1">
                                                {activity.description}
                                            </p>
                                            {activity.users && (
                                                <p className="text-[10px] sm:text-xs text-slate-500">
                                                    by {activity.users.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
