import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Building2, Clock, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Real-time Operations</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            HotelOps <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Live</span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            The unified real-time control center for hotel operations.
            Manage rooms, tasks, and guest services all in one elegant dashboard.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
              View Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <Zap className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Real-Time Updates</h3>
            <p className="text-slate-400 text-sm">
              Instant synchronization across all devices. See changes as they happen.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <Building2 className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Room Management</h3>
            <p className="text-slate-400 text-sm">
              Visual room status board with color-coded availability tracking.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <Users className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Team Collaboration</h3>
            <p className="text-slate-400 text-sm">
              Assign tasks, track progress, and coordinate with your team seamlessly.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <Clock className="w-10 h-10 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Live Activity Feed</h3>
            <p className="text-slate-400 text-sm">
              Monitor all operations in real-time with comprehensive activity logging.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Built with Modern Technology</h3>
          <div className="flex flex-wrap gap-3 justify-center text-sm text-slate-300">
            <span className="px-4 py-2 bg-slate-700/50 rounded-lg">Next.js 14</span>
            <span className="px-4 py-2 bg-slate-700/50 rounded-lg">Supabase</span>
            <span className="px-4 py-2 bg-slate-700/50 rounded-lg">TypeScript</span>
            <span className="px-4 py-2 bg-slate-700/50 rounded-lg">Tailwind CSS</span>
            <span className="px-4 py-2 bg-slate-700/50 rounded-lg">Real-time WebSockets</span>
          </div>
        </div>
      </div>
    </div>
  )
}
            Deploy Now
          </a >
  <a
    className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
    href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    target="_blank"
    rel="noopener noreferrer"
  >
    Documentation
  </a>
        </div >
      </main >
    </div >
  );
}
