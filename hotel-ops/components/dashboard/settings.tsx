'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Building, User, Mail, Phone } from 'lucide-react'

interface SettingsProps {
    user: any
    userData: any
    hotel: any
}

export default function Settings({ user, userData, hotel: initialHotel }: SettingsProps) {
    const [hotel, setHotel] = useState(initialHotel)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    const handleUpdateHotel = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)

        try {
            const formData = new FormData(e.currentTarget)
            const { error } = await supabase
                .from('hotels')
                .update({
                    name: formData.get('hotelName'),
                    address: formData.get('hotelAddress'),
                    phone: formData.get('hotelPhone'),
                })
                .eq('id', hotel.id)

            if (error) throw error

            toast.success('Hotel information updated')
        } catch (error) {
            console.error('Error updating hotel:', error)
            toast.error('Failed to update hotel information')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)

        try {
            const formData = new FormData(e.currentTarget)
            const { error } = await supabase
                .from('users')
                .update({
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                })
                .eq('id', user.id)

            if (error) throw error

            toast.success('Profile updated')
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-slate-400 mt-2">Manage your hotel and account settings</p>
            </div>

            {/* Hotel Settings */}
            <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Hotel Information
                    </CardTitle>
                    <CardDescription>Update your hotel details</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateHotel} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="hotelName">Hotel Name</Label>
                            <Input
                                id="hotelName"
                                name="hotelName"
                                defaultValue={hotel.name}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hotelAddress">Address</Label>
                            <Input
                                id="hotelAddress"
                                name="hotelAddress"
                                defaultValue={hotel.address || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hotelPhone">Phone</Label>
                            <Input
                                id="hotelPhone"
                                name="hotelPhone"
                                type="tel"
                                defaultValue={hotel.phone || ''}
                            />
                        </div>
                        <Button type="submit" disabled={saving}>
                            Save Hotel Information
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Profile Settings */}
            <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Your Profile
                    </CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={userData.name}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    value={user.email}
                                    disabled
                                    className="flex-1"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Email cannot be changed</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    defaultValue={userData.phone || ''}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input
                                value={userData.role}
                                disabled
                                className="capitalize"
                            />
                        </div>
                        <Button type="submit" disabled={saving}>
                            Save Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                        <span className="text-slate-400">User ID</span>
                        <span className="font-mono text-xs">{user.id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                        <span className="text-slate-400">Hotel ID</span>
                        <span className="font-mono text-xs">{hotel.id}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-slate-400">Account Created</span>
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
