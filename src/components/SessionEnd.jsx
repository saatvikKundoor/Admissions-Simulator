// SessionEnd.jsx
// Session summary screen. Reached either by finishing a full session (App
// auto-advances after SESSION_LENGTH rounds) or by hitting "End Session" on
// the RevealScreen. Reuses the dark score-card + pastel-stat-card language
// established in RevealScreen/ProfileCard so it reads as part of the same
// product rather than a bolted-on screen.
//
// Reveal choreography: the big "X / Y" score counts up first. Once that
// finishes, the three stat cards (Accuracy, Correct, Applicants) count up
// together, and the Play Again button fades in once those finish.

import { useEffect, useState } from 'react'

const FLAVOR = [
  { min: 100, max: 100, text: "A perfect read. You might actually work in admissions." },
  { min: 75,  max: 99,  text: "Sharp instincts. Most people don't do this well." },
  { min: 50,  max: 74,  text: "Respectable. Admissions is harder than it looks." },
  { min: 25,  max: 49,  text: "The process is more surprising than you expected, isn't it?" },
  { min: 0,   max: 24,  text: "Don't worry — even AOs are wrong sometimes." },
]

function flavorText(pct, total) {
  if (total === 0) return "No schools guessed yet — every read counts."
  return FLAVOR.find(f => pct >= f.min && pct <= f.max)?.text ?? ''
}

const MAIN_DURATION_MS = 700
const STAT_DURATION_MS = 550

function StatCard({ label, value, color }) {
  const colors = {
    teal:     'bg-[#C8E6E2]',
    lavender: 'bg-[#E8E4F3]',
    sky:      'bg-[#D4EAF5]',
  }
  return (
    <div className={`rounded-2xl px-7 py-6 text-center ${colors[color] ?? 'bg-slate-100'}`}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
         className="text-sm uppercase tracking-widest text-slate-600 mb-2">
        {label}
      </p>
      <p style={{ fontFamily: "'Playfair Display', serif" }}
         className="text-3xl md:text-4xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  )
}

export default function SessionEnd({ correct, total, profileCount, onPlayAgain }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  // Phase 1 — big score count-up
  const [correctDisplay, setCorrectDisplay] = useState(0)
  const [totalDisplay, setTotalDisplay]     = useState(0)
  const [mainDone, setMainDone]             = useState(false)

  // Phase 2 — stat cards count up together, once phase 1 finishes
  const [pctDisplay, setPctDisplay]                 = useState(0)
  const [correctStatDisplay, setCorrectStatDisplay] = useState(0)
  const [applicantsDisplay, setApplicantsDisplay]   = useState(0)
  const [statsDone, setStatsDone]                   = useState(false)

  // Phase 1: animate the big "X / Y" score
  useEffect(() => {
    if (correct === 0 && total === 0) {
      setMainDone(true)
      return
    }
    let raf
    const start = performance.now()
    function tick(now) {
      const elapsed  = now - start
      const progress = Math.min(elapsed / MAIN_DURATION_MS, 1)
      setCorrectDisplay(Math.round(progress * correct))
      setTotalDisplay(Math.round(progress * total))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setMainDone(true)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Phase 2: once the main score is done, animate accuracy / correct /
  // applicants simultaneously.
  useEffect(() => {
    if (!mainDone) return
    if (pct === 0 && correct === 0 && profileCount === 0) {
      setStatsDone(true)
      return
    }
    let raf
    const start = performance.now()
    function tick(now) {
      const elapsed  = now - start
      const progress = Math.min(elapsed / STAT_DURATION_MS, 1)
      setPctDisplay(Math.round(progress * pct))
      setCorrectStatDisplay(Math.round(progress * correct))
      setApplicantsDisplay(Math.round(progress * profileCount))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setStatsDone(true)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainDone])

  return (
    <div className="max-w-4xl w-full">
      <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
         className="text-slate-400 text-lg md:text-xl uppercase tracking-widest mb-8 text-center">
        Session Complete
      </p>

      {/* Primary score card — same dark treatment as RevealScreen's Round Score, sized up */}
      <div className="bg-slate-900 rounded-3xl px-10 py-14 text-center mb-6">
        <p style={{ fontFamily: "'Playfair Display', serif" }}
           className="text-white text-6xl md:text-7xl font-semibold mb-4">
          {correctDisplay} / {totalDisplay}
        </p>
        <p className="text-slate-400 text-base mb-2">
          schools correctly predicted across {profileCount} applicant{profileCount !== 1 ? 's' : ''}
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif" }}
           className={`text-slate-200 text-lg mt-6 transition-opacity duration-500 ${
             mainDone ? 'opacity-100' : 'opacity-0'
           }`}>
          {flavorText(pct, total)}
        </p>
      </div>

      {/* Secondary stat breakdown — pastel cards matching ProfileCard's palette,
          count up together once the main score finishes */}
      <div className={`grid grid-cols-3 gap-4 mb-10 transition-opacity duration-500 ${
        mainDone ? 'opacity-100' : 'opacity-0'
      }`}>
        <StatCard label="Accuracy"   value={`${pctDisplay}%`} color="teal" />
        <StatCard label="Correct"    value={correctStatDisplay} color="lavender" />
        <StatCard label="Applicants" value={applicantsDisplay} color="sky" />
      </div>

      <div className={`flex justify-end transition-opacity duration-500 ${
        statsDone ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <button
          onClick={onPlayAgain}
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="px-10 py-4 rounded-xl font-semibold text-base tracking-wide
                     bg-slate-900 text-white hover:bg-slate-700 transition-colors"
        >
          Play Again →
        </button>
      </div>
    </div>
  )
}