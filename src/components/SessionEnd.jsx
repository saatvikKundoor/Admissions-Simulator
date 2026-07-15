// SessionEnd.jsx
import { useEffect, useState } from 'react'
import { playCelebration, playConsolation } from '../lib/sound'

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

function StatCard({ label, value, color, delay, trigger }) {
  const colors = {
    teal:     'bg-[#C8E6E2]',
    lavender: 'bg-[#E8E4F3]',
    sky:      'bg-[#D4EAF5]',
  }
  
  return (
    <div 
      style={{ animationDelay: delay }}
      className={`rounded-2xl px-7 py-6 text-center shadow-sm ${colors[color] ?? 'bg-slate-100'} ${
        trigger ? 'animate-stamp' : 'opacity-0'
      }`}
    >
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

  // Confetti piece structural state
  const [confettiPieces, setConfettiPieces] = useState([])

  // Pre-generate paper confetti metadata if score qualifies (75%+)
  useEffect(() => {
    if (pct >= 75 && total > 0) {
      const paperColors = ['#C8E6E2', '#E8E4F3', '#D4EAF5', '#F8FAFFC0', '#F1F5F9']
      const pieces = Array.from({ length: 35 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1.2}s`,
        size: `${Math.random() * 10 + 10}px`,
        color: paperColors[Math.floor(Math.random() * paperColors.length)],
        aspectRatio: Math.random() > 0.4 ? 'w-4 h-6' : 'w-5 h-5'
      }))
      setConfettiPieces(pieces)
    }
  }, [pct, total])

  // Phase 1: animate the big "X / Y" score & fire landing thresholds
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
        
        // WIRED SOUND EFFECTS: Fires immediately when the numbers finish ticking
        if (total > 0) {
          if (pct >= 75) {
            playCelebration()
          } else if (pct < 25) { // Fixed boundary condition
            playConsolation()
          }
        }
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [correct, total, pct])

  // Phase 2: animate sub-stats counters
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
  }, [mainDone, pct, correct, profileCount])

  return (
    <div className="max-w-4xl w-full relative">
      
      {/* High Score Celebration: Acceptance Paper Confetti */}
      {pct >= 75 && mainDone && (
        <div className="absolute inset-0 top-[-20px] left-0 right-0 bottom-0 pointer-events-none overflow-hidden z-50">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className={`absolute animate-confetti ${piece.aspectRatio}`}
              style={{
                left: piece.left,
                backgroundColor: piece.color,
                animationDelay: piece.delay,
                transform: 'translateY(-30px)'
              }}
            />
          ))}
        </div>
      )}

      <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
         className="text-slate-400 text-lg md:text-xl uppercase tracking-widest mb-8 text-center">
        Session Complete
      </p>

      {/* Primary score card */}
      <div className="bg-slate-900 rounded-3xl px-10 py-14 text-center mb-6 relative overflow-hidden shadow-xl border border-slate-800">
        <p style={{ fontFamily: "'Playfair Display', serif" }}
           className="text-white text-6xl md:text-7xl font-semibold mb-4 relative z-10">
          {correctDisplay} / {totalDisplay}
        </p>
        <p className="text-slate-400 text-base mb-2 relative z-10">
          schools correctly predicted across {profileCount} applicant{profileCount !== 1 ? 's' : ''}
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif" }}
           className={`text-slate-200 text-lg mt-6 transition-opacity duration-500 relative z-10 ${
             mainDone ? 'opacity-100' : 'opacity-0'
           }`}>
          {flavorText(pct, total)}
        </p>

        {/* Low Score Humor: Angled Rubber Stamp overlay */}
        {pct < 25 && total > 0 && mainDone && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-stamp">
            <div 
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="border-4 border-red-500/80 text-red-500/80 uppercase font-extrabold text-4xl md:text-6xl tracking-widest px-8 py-3 rounded-2xl rotate-[-12deg] bg-slate-900/60 backdrop-blur-[1px] shadow-2xl tracking-tighter"
            >
               You're Fired! 
            </div>
          </div>
        )}
      </div>

      {/* Secondary stat breakdown — Staggered Rubber Stamp Drop Animation */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard label="Accuracy"   value={`${pctDisplay}%`} color="teal"     delay="0ms"   trigger={mainDone} />
        <StatCard label="Correct"    value={correctStatDisplay} color="lavender" delay="120ms" trigger={mainDone} />
        <StatCard label="Applicants" value={applicantsDisplay}   color="sky"      delay="240ms" trigger={mainDone} />
      </div>

      <div className={`flex justify-end transition-opacity duration-500 ${
        statsDone ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <button
          onClick={onPlayAgain}
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="px-10 py-4 rounded-xl font-semibold text-base tracking-wide
                     bg-slate-900 text-white hover:bg-slate-700 transition-colors shadow-md"
        >
          Play Again →
        </button>
      </div>
    </div>
  )
}