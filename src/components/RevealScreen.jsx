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

export default function RevealScreen({ profile, guesses, onNext }) {
  const schools = profile.schools ?? []
  const [visibleCount, setVisibleCount] = useState(0)

  // Stagger reveal: one school every 400ms
  useEffect(() => {
    if (visibleCount >= schools.length) return
    const timer = setTimeout(() => setVisibleCount(v => v + 1), 400)
    return () => clearTimeout(timer)
  }, [visibleCount, schools.length])

  const correct = scoreGuesses(schools, guesses)
  const total   = schools.length
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0
  const allRevealed = visibleCount >= schools.length

  return (
    <div className="max-w-5xl mx-auto">
      {/* Score header — shown only after all schools reveal */}
      <div className={`mb-6 transition-opacity duration-500 ${allRevealed ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-slate-900 rounded-2xl px-6 py-5 text-center">
          <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
             className="text-slate-400 text-xs uppercase tracking-widest mb-1">
            Round Score
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif" }}
             className="text-white text-4xl font-semibold mb-1">
            {correct} / {total}
          </p>
          <p className="text-slate-300 text-sm">{flavorText(pct)}</p>
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

      {/* Next button — appears after all revealed */}
      <div className={`flex justify-end transition-opacity duration-500 ${allRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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