import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import LandingPage from './components/LandingPage'
import ProfileCard from './components/ProfileCard'
import RevealScreen from './components/RevealScreen'
import SessionEnd from './components/SessionEnd'
import { isSoundEnabled, setSoundEnabled } from './lib/sound'

const CYCLE = [null, 'Admitted', 'Waitlisted', 'Rejected']
const SESSION_LENGTH = 8

function scoreGuesses(schools, guesses) {
  let correct = 0
  for (const school of schools) {
    if (guesses[school.id] === school.outcome) correct++
  }
  return correct
}
// Fisher–Yates shuffle — returns a new array, doesn't mutate the original
function shuffleArray(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
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
  const [soundOn, setSoundOn]             = useState(() => isSoundEnabled())
  const [profileStartTime, setProfileStartTime] = useState(null)
  const [roundElapsedMs, setRoundElapsedMs]     = useState(0)
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
        setProfile({ ...data, schools: shuffleArray(data.schools) })
        setSeenIds(prev => [...prev, randomId])
        setProfileStartTime(Date.now())
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

  function toggleSound() {
    setSoundOn(prev => {
      const next = !prev
      setSoundEnabled(next)
      return next
    })
  }

  function handleSubmit() {
    if (profileStartTime) setRoundElapsedMs(Date.now() - profileStartTime)
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

  // Lets the player end the session early from the reveal screen — the current
  // round's score still counts, but instead of loading another profile we jump
  // straight to the session summary.
  function handleEndSession() {
    const round = scoreGuesses(profile.schools, guesses)
    setSessionCorrect(c => c + round)
    setSessionTotal(t => t + profile.schools.length)
    setSessionCount(c => c + 1)
    setShowSessionEnd(true)
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
    <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center px-6 md:px-10 lg:px-16 py-16">
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
      <header className="px-6 md:px-10 lg:px-16 pt-10 pb-6 flex items-start justify-between">
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
          <div className="flex items-center gap-2 mt-2 shrink-0">
            <button
              onClick={toggleSound}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white
                         text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {soundOn ? '🔊 Sound on' : '🔇 Sound off'}
            </button>
            <button
              onClick={toggleMode}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white
                         text-xs text-slate-600 hover:bg-slate-50 transition-colors
                         inline-flex items-center gap-1.5"
            >
              <span className="relative w-4 h-4 flex items-center justify-center shrink-0">
                {/* Drag Icon: active when in 'cycle' mode (the target mode to switch to) */}
                <span
                  className={`absolute inset-0 mode-toggle-transition ${
                    guessMode === 'cycle'
                      ? 'opacity-100 scale-100 rotate-0'
                      : 'opacity-0 scale-75 -rotate-12 pointer-events-none'
                  }`}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#aa3bff"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full h-full"
                  >
                    <path d="M10 3v14M3 10h14" />
                    <path d="M7 5l3-3 3 3" />
                    <path d="M7 15l3 3-3 3" />
                    <path d="M5 7l-3 3 3 3" />
                    <path d="M15 7l3 3-3 3" />
                  </svg>
                </span>

                {/* Tap Icon: active when in 'drag' mode (the target mode to switch to) */}
                <span
                  className={`absolute inset-0 mode-toggle-transition ${
                    guessMode === 'drag'
                      ? 'opacity-100 scale-100 rotate-0'
                      : 'opacity-0 scale-75 rotate-12 pointer-events-none'
                  }`}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#aa3bff"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full h-full"
                  >
                    <rect x="3" y="3" width="14" height="14" rx="3" />
                    <path d="m6.5 10 2.5 2.5 4.5-5" />
                  </svg>
                </span>
              </span>
              <span>{guessMode === 'cycle' ? 'Drag mode' : 'Tap mode'}</span>
            </button>
          </div>
        )}
      </header>

      <main className="px-6 md:px-10 lg:px-16 pb-16">
        {!submitted ? (
          <ProfileCard
            profile={profile}
            guesses={guesses}
            onCycle={handleCycle}
            onDrop={handleDrop}
            guessMode={guessMode}
            anyGuessed={anyGuessed}
            onSubmit={handleSubmit}
          />
        ) : (
          <RevealScreen
            profile={profile}
            guesses={guesses}
            onNext={handleNext}
            onEndSession={handleEndSession}
            elapsedMs={roundElapsedMs}
          />
        )}
      </main>
    </div>
  )
}