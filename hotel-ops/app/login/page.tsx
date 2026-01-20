'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Building2, User } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [guestCode, setGuestCode] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleStaffLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            toast.error('Login failed', {
                description: error.message,
            })
        } else {
            toast.success('Login successful!')
            router.push('/dashboard')
            router.refresh()
        }

        setLoading(false)
    }

    const handleGuestLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Verify guest code (pad with leading zeros if needed)
            const paddedCode = guestCode.padStart(6, '0')

            const { data: guests, error } = await supabase
                .from('guests')
                .select('*, bookings(*, rooms(room_number, hotel_id))')
                .eq('guest_code', paddedCode)


            if (error || !guests || guests.length === 0) {
                toast.error('Invalid guest code', {
                    description: 'Please check your 6-digit guest code and try again'
                })
                setLoading(false)
                return
            }

            const guest = Array.isArray(guests) ? guests[0] : guests

            // Store guest session in localStorage
            localStorage.setItem('guest_session', JSON.stringify({
                guest_id: guest.id,
                guest_code: guestCode,
                name: guest.name
            }))

            toast.success(`Welcome, ${guest.name}!`)
            router.push('/guest-portal')
        } catch (error) {
            console.error('Guest login error:', error)
            toast.error('Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-black p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-6 w-6 text-green-500" />
                        <CardTitle className="text-2xl font-bold">HotelOps Live</CardTitle>
                    </div>
                    <CardDescription>
                        Sign in to access the platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="staff" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="staff">Staff</TabsTrigger>
                            <TabsTrigger value="guest">Guest</TabsTrigger>
                        </TabsList>

                        <TabsContent value="staff" className="space-y-4 mt-4">
                            <form onSubmit={handleStaffLogin} className="space-y-4">
                                <div className="space-y-2 px-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="manager@hotel.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>
                            <div className="text-center text-sm">
                                <span className="text-muted-foreground">Don't have an account? </span>
                                <Link href="/signup" className="text-green-500 hover:underline">
                                    Sign up
                                </Link>
                            </div>
                        </TabsContent>

                        <TabsContent value="guest" className="space-y-4 mt-4">
                            <form onSubmit={handleGuestLogin} className="space-y-4">
                                <div className="space-y-2 px-1">
                                    <Label htmlFor="guestCode">Guest Code</Label>
                                    <Input
                                        id="guestCode"
                                        type="text"
                                        value={guestCode}
                                        onChange={(e) => setGuestCode(e.target.value.toUpperCase())}
                                        placeholder="Enter your 6-digit code"
                                        maxLength={6}
                                        required
                                        disabled={loading}
                                        className="text-center text-2xl tracking-widest"
                                    />
                                    <p className="text-xs text-muted-foreground text-center">
                                        Your guest code was provided at check-in
                                    </p>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    <User className="mr-2 h-4 w-4" />
                                    {loading ? 'Verifying...' : 'Access Guest Portal'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
