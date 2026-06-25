import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import ProfileCard from './components/ProfileCard'

export default function App() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select(`*, schools (*)`)
        .limit(1)
        .single()

      if (error) {
        setError(error.message ?? JSON.stringify(error))
      } else {
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center">
        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
           className="text-slate-400 text-sm">Loading profile…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
          <p className="text-sm font-semibold text-red-600 mb-1">Database error</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center">
        <p className="text-slate-400 text-sm">No profiles found in database.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2F0EB]">
      {/* Page header */}
      <header className="px-6 pt-10 pb-6 max-w-5xl mx-auto">
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl font-semibold text-slate-900 tracking-tight">
          Admissions Simulator
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif" }}
           className="text-slate-500 text-sm mt-1">
          Think like an admissions officer. Who got in?
        </p>
      </header>

      {/* Profile card */}
      <main className="px-6 pb-16 max-w-5xl mx-auto">
        <ProfileCard profile={profile} />

        {/* Submit — wired up on Day 10 */}
        <div className="mt-6 flex justify-end">
          <button
            className="px-8 py-3 rounded-xl font-semibold text-sm tracking-wide
                       bg-slate-900 text-white hover:bg-slate-700 transition-colors
                       disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            Submit Guesses
          </button>
        </div>
      </main>
    </div>
  )
}