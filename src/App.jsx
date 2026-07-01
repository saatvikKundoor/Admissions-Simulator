import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import LandingPage from './components/LandingPage'
import ProfileCard from './components/ProfileCard'
import RevealScreen from './components/RevealScreen'
import SessionEnd from './components/SessionEnd'

const CYCLE = [null, 'Admitted', 'Waitlisted', 'Rejected']
const SESSION_LENGTH = 8

function scoreGuesses(schools, guesses) {
  let correct = 0
  for (const school of schools) {
    if (guesses[school.id] === school.outcome) correct++
  }
  return correct
}

export default function App() {
  const [gameStarted, setGameStarted]     = useState(false)
  const [profile, setProfile]             = useState(null)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [guesses, setGuesses]             = useState({})
  const [submitted, setSubmitted]         = useState(false)
  const [seenIds, setSeenIds]             = useState([])
  const [guessMode, setGuessMode]         = useState(
    () => localStorage.getItem('guessMode') ?? 'cycle'
  )
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal]     = useState(0)
  const [sessionCount, setSessionCount]     = useState(0)
  const [showSessionEnd, setShowSessionEnd] = useState(false)

  const fetchRandomProfile = useCallback(async (currentSeenIds) => {
    setLoading(true)
    setError(null)
    setGuesses({})
    setSubmitted(false)

    const { data: idRows, error: idError } = await supabase
      .from('profiles')
      .select('id')

    if (idError) { setError(idError.message); setLoading(false); return }

    const allIds    = idRows.map(r => r.id)
    const available = allIds.filter(id => !currentSeenIds.includes(id))
    const pool      = available.length > 0 ? available : allIds

    const randomId  = pool[Math.floor(Math.random() * pool.length)]

    const { data, error } = await supabase
      .from('profiles')
      .select('*, schools (*)')
      .eq('id', randomId)
      .single()

    if (error) {
      setError(error.message)
    } else {
      setProfile(data)
      setSeenIds(prev => [...prev, randomId])
    }
    setLoading(false)
  }, [])

  // Fetch first profile once game starts
  useEffect(() => {
    if (gameStarted) fetchRandomProfile([])
  }, [gameStarted, fetchRandomProfile])

  function handleCycle(schoolId) {
    setGuesses(prev => {
      const current = prev[schoolId] ?? null
      const next    = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length]
      return { ...prev, [schoolId]: next }
    })
  }

  function handleDrop(schoolId, outcome) {
    setGuesses(prev => ({ ...prev, [schoolId]: outcome }))
  }

  function toggleMode() {
    setGuessMode(prev => {
      const next = prev === 'cycle' ? 'drag' : 'cycle'
      localStorage.setItem('guessMode', next)
      return next
    })
  }

  function handleSubmit() {
    setSubmitted(true)
  }

  function handleNext() {
    const round = scoreGuesses(profile.schools, guesses)
    setSessionCorrect(c => c + round)
    setSessionTotal(t => t + profile.schools.length)
    const next = sessionCount + 1
    setSessionCount(next)
    if (next >= SESSION_LENGTH) {
      setShowSessionEnd(true)
    } else {
      fetchRandomProfile(seenIds)
    }
  }

  function handlePlayAgain() {
    setSessionCorrect(0)
    setSessionTotal(0)
    setSessionCount(0)
    setShowSessionEnd(false)
    setSeenIds([])
    fetchRandomProfile([])
  }

  const anyGuessed = Object.values(guesses).some(v => v !== null)

  if (!gameStarted) return <LandingPage onStart={() => setGameStarted(true)} />

  if (showSessionEnd) return (
    <div className="min-h-screen bg-[#F2F0EB] px-6 py-16 max-w-5xl mx-auto">
      <SessionEnd
        correct={sessionCorrect}
        total={sessionTotal}
        profileCount={sessionCount}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center">
      <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
         className="text-slate-400 text-sm">Loading profile…</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
        <p className="text-sm font-semibold text-red-600 mb-1">Database error</p>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    </div>
  )

  if (!profile) return null

  return (
    <div className="min-h-screen bg-[#F2F0EB]">
      <header className="px-6 pt-10 pb-6 max-w-5xl mx-auto flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-4xl font-semibold text-slate-900 tracking-tight">
            Admissions Simulator
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif" }}
             className="text-slate-500 text-sm mt-1">
            Think like an admissions officer. Who got in?
          </p>
        </div>
        {!submitted && (
          <button
            onClick={toggleMode}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="mt-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white
                       text-xs text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
          >
            {guessMode === 'cycle' ? '⇄ Drag mode' : '☑ Tap mode'}
          </button>
        )}
      </header>

      <main className="px-6 pb-16 max-w-5xl mx-auto">
        {!submitted ? (
          <>
            <ProfileCard
              profile={profile}
              guesses={guesses}
              onCycle={handleCycle}
              onDrop={handleDrop}
              guessMode={guessMode}
            />
            <div className="mt-6 flex items-center justify-end gap-4">
              {!anyGuessed && (
                <p style={{ fontFamily: "'Inter', sans-serif" }}
                   className="text-sm text-slate-400">
                  {guessMode === 'cycle'
                    ? 'Tap schools on the right to make predictions'
                    : 'Drag schools into a column'}
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
            onNext={handleNext}
          />
        )}
      </main>
    </div>
  )
}