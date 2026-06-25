import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import ProfileCard from './components/ProfileCard'
import RevealScreen from './components/RevealScreen'

// Cycles a school's guess: null → Admitted → Waitlisted → Rejected → null
const CYCLE = [null, 'Admitted', 'Waitlisted', 'Rejected']

export default function App() {
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  // guesses: { [schoolId]: 'Admitted' | 'Waitlisted' | 'Rejected' | null }
  const [guesses, setGuesses]   = useState({})
  const [submitted, setSubmitted] = useState(false)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    setGuesses({})
    setSubmitted(false)

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
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  function handleCycle(schoolId) {
    setGuesses(prev => {
      const current = prev[schoolId] ?? null
      const idx     = CYCLE.indexOf(current)
      const next    = CYCLE[(idx + 1) % CYCLE.length]
      return { ...prev, [schoolId]: next }
    })
  }

  function handleSubmit() {
    setSubmitted(true)
  }

  const anyGuessed = Object.values(guesses).some(v => v !== null)

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center">
        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
           className="text-slate-400 text-sm">Loading profile…</p>
      </div>
    )
  }

  // ── Error ──
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

      <main className="px-6 pb-16 max-w-5xl mx-auto">
        {!submitted ? (
          <>
            <ProfileCard
              profile={profile}
              guesses={guesses}
              onCycle={handleCycle}
            />
            <div className="mt-6 flex items-center justify-end gap-4">
              {!anyGuessed && (
                <p style={{ fontFamily: "'Inter', sans-serif" }}
                   className="text-sm text-slate-400">
                  Tap schools on the right to make predictions
                </p>
              )}
              <button
                onClick={handleSubmit}
                disabled={!anyGuessed}
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="px-8 py-3 rounded-xl font-semibold text-sm tracking-wide transition-colors
                           bg-slate-900 text-white hover:bg-slate-700
                           disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                Submit Guesses
              </button>
            </div>
          </>
        ) : (
          <RevealScreen
            profile={profile}
            guesses={guesses}
            onNext={fetchProfile}
          />
        )}
      </main>
    </div>
  )
}