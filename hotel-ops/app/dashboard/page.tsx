import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoomGrid } from '@/components/dashboard/room-grid'
import { ActivityFeed } from '@/components/dashboard/activity-feed'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user's hotel
    const { data: userData } = await supabase
        .from('users')
        .select('hotel_id, name, role')
        .eq('id', user.id)
        .single()

    if (!userData?.hotel_id) {
        redirect('/login')
    }

    // Get dashboard stats
    const [roomsData, tasksData] = await Promise.all([
        supabase
            .from('rooms')
            .select('status, rate')
            .eq('hotel_id', userData.hotel_id),
        supabase
            .from('tasks')
            .select('status, priority')
            .eq('hotel_id', userData.hotel_id),
    ])

    const totalRooms = roomsData.data?.length || 0
    const occupiedRooms = roomsData.data?.filter((r) => r.status === 'occupied').length || 0
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
    const pendingTasks = tasksData.data?.filter((t) => t.status === 'pending').length || 0
    const todayRevenue = roomsData.data
        ?.filter((r) => r.status === 'occupied')
        .reduce((sum, r) => sum + (r.rate || 0), 0) || 0

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Rooms</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-2xl font-bold text-white">{totalRooms}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {occupancyRate}% occupancy
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">Occupied</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-2xl font-bold text-white">{occupiedRooms}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {roomsData.data?.filter((r) => r.status === 'cleaning').length || 0} cleaning
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-2xl font-bold text-white">{pendingTasks}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {tasksData.data?.filter((t) => t.priority === 'high').length || 0} high priority
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                        <CardTitle className="text-xs sm:text-sm font-medium">Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-2xl font-bold text-white">${todayRevenue.toLocaleString()}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                {/* Room Grid - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <RoomGrid hotelId={userData.hotel_id} />
                </div>

                {/* Activity Feed - Takes 1 column */}
                <div className="lg:col-span-1">
                    <ActivityFeed hotelId={userData.hotel_id} />
                </div>
            </div>
        </div>
    )
}
