// RevealScreen.jsx — Days 11–13
// Shows actual outcomes vs player guesses, animated stagger, score + flavor text

import { useEffect, useState } from 'react'

const OUTCOME_STYLE = {
  Admitted:   { bg: 'bg-green-100',  border: 'border-green-300',  text: 'text-green-800'  },
  Rejected:   { bg: 'bg-red-100',    border: 'border-red-300',    text: 'text-red-800'    },
  Waitlisted: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
  Deferred:   { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
}

const ICON = {
  Admitted:   '/icons/admitted.png',
  Waitlisted: '/icons/waitlisted.png',
  Rejected:   '/icons/rejected.png',
}

const FLAVOR = [
  { min: 100, max: 100, text: "You might actually work in admissions." },
  { min: 75,  max: 99,  text: "Sharp read. Most people don't do this well." },
  { min: 50,  max: 74,  text: "Respectable. Admissions is harder than it looks." },
  { min: 25,  max: 49,  text: "The process is more surprising than you expected, isn't it?" },
  { min: 0,   max: 24,  text: "Don't worry — even AOs are wrong sometimes." },
]

function flavorText(pct) {
  return FLAVOR.find(f => pct >= f.min && pct <= f.max)?.text ?? ''
}

// A guess is "correct" if the player's prediction matches the actual outcome.
// Unguessed schools count as incorrect.
function scoreGuesses(schools, guesses) {
  let correct = 0
  schools.forEach(school => {
    const actual = school.outcome
    const predicted = guesses[school.id] ?? null
    if (predicted === actual) correct++
  })
  return correct
}

// Reveal order is by actual outcome — Admitted first, then Waitlisted, then
// Rejected, then anything else (e.g. Deferred) — regardless of what the
// player guessed or what order the schools came back from Supabase.
const OUTCOME_ORDER = { Admitted: 0, Waitlisted: 1, Rejected: 2, Deferred: 3 }

function sortByOutcome(schools) {
  return [...schools].sort((a, b) => {
    const orderA = OUTCOME_ORDER[a.outcome] ?? 99
    const orderB = OUTCOME_ORDER[b.outcome] ?? 99
    return orderA - orderB
  })
}

const COUNT_DURATION_MS = 600

export default function RevealScreen({ profile, guesses, onNext, onEndSession }) {
  const schools = sortByOutcome(profile.schools ?? [])
  const [visibleCount, setVisibleCount] = useState(0)
  const [countDisplay, setCountDisplay] = useState(0)
  const [countDone, setCountDone] = useState(false)

  const correct = scoreGuesses(schools, guesses)
  const total   = schools.length
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0
  const allRevealed = visibleCount >= schools.length

  // Fast count-up: numerator animates 0 → correct over a fixed duration,
  // regardless of how big the score is. Denominator shows immediately (below).
  useEffect(() => {
    if (correct === 0) {
      setCountDisplay(0)
      setCountDone(true)
      return
    }
    let raf
    const start = performance.now()
    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / COUNT_DURATION_MS, 1)
      setCountDisplay(Math.round(progress * correct))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setCountDone(true)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stagger reveal: one school every 400ms, but only starts once the
  // count-up has finished and the flavor text has appeared.
  useEffect(() => {
    if (!countDone) return
    if (visibleCount >= schools.length) return
    const timer = setTimeout(() => setVisibleCount(v => v + 1), 200)
    return () => clearTimeout(timer)
  }, [countDone, visibleCount, schools.length])

  return (
    <div className="max-w-5xl mx-auto">
      {/* Score header — visible immediately, count-up then flavor text fade in */}
      <div className="mb-6">
        <div className="bg-slate-900 rounded-2xl px-6 py-5 text-center">
          <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
             className="text-slate-400 text-xs uppercase tracking-widest mb-1">
            Round Score
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif" }}
             className="text-white text-4xl font-semibold mb-1">
            {countDisplay} / {total}
          </p>
          <p className={`text-slate-300 text-sm transition-opacity duration-500 ${
            countDone ? 'opacity-100' : 'opacity-0'
          }`}>
            {flavorText(pct)}
          </p>
        </div>
      </div>

      {/* School reveal list */}
      <div className="bg-[#E2E4EA] rounded-2xl p-5 mb-6">
        <h2 style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-2xl font-semibold text-slate-800 mb-4">
          Results
        </h2>
        <div className="space-y-2">
          {schools.map((school, i) => {
            const actual    = school.outcome ?? 'Unknown'
            const predicted = guesses[school.id] ?? null
            const isCorrect = predicted === actual
            const style     = OUTCOME_STYLE[actual] ?? OUTCOME_STYLE['Rejected']
            const visible   = i < visibleCount

            return (
              <div
                key={school.id}
                className={`rounded-xl border px-4 py-3 transition-all duration-400
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                  ${style.bg} ${style.border}`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* School name + outcome */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${style.text} truncate`}>
                      {school.school_name}
                    </p>
                    <p className={`text-xs ${style.text} opacity-75`}>{actual}</p>
                  </div>

                  {/* Your guess vs result */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Player's guess icon */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-0.5">You</span>
                      {predicted
                        ? <img src={ICON[predicted]} alt={predicted} className="w-7 h-7" />
                        : <div className="w-7 h-7 rounded border-2 border-dashed border-slate-300" />
                      }
                    </div>

                    {/* Correct/wrong indicator */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </div>

                    {/* Actual outcome icon */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-0.5">Actual</span>
                      {ICON[actual]
                        ? <img src={ICON[actual]} alt={actual} className="w-7 h-7" />
                        : <span className={`text-xs font-semibold ${style.text}`}>{actual}</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Next Applicant (primary) + End Session (secondary) — appear after all revealed.
          End Session sits to the left as a lower-emphasis outlined button so the
          forward action (Next Applicant) stays the dominant, rightmost choice. */}
      <div className={`flex justify-end items-center gap-3 transition-opacity duration-500 ${allRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={onEndSession}
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="px-6 py-3 rounded-xl font-semibold text-sm tracking-wide transition-colors
                     border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
        >
          End Session
        </button>
        <button
          onClick={onNext}
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="px-8 py-3 rounded-xl font-semibold text-sm tracking-wide
                     bg-slate-900 text-white hover:bg-slate-700 transition-colors"
        >
          Next Applicant →
        </button>
      </div>
    </div>
  )
}