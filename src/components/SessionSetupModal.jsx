// SessionSetupModal.jsx
// Shown after "Start Game" on the landing page, before the first profile
// fetches. Lets the player pick how many applicants they want in this
// session (1-20, default 5). Closing via the X reveals the landing page
// again without starting the game.

import { playClick, playToggleClick, playSliderSnap } from '../lib/uiSfx'

function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

const MIN = 1
const MAX = 20

export default function SessionSetupModal({ value, onChange, onClose, onBegin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative bg-[#F2F0EB] rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={() => { playToggleClick(); onClose() }}
          aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
           className="text-slate-400 text-xs uppercase tracking-widest mb-2">
          Session length
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-2xl font-semibold text-slate-900 mb-6">
          How many applicants?
        </h2>

        <div className="mb-8">
          <p style={{ fontFamily: "'Playfair Display', serif" }}
             className="text-5xl font-semibold text-slate-900 text-center mb-4">
            {value}
          </p>
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={1}
            value={value}
            onChange={(e) => {
               const next = Number(e.target.value)
               if (next !== value) playSliderSnap((next - MIN) / (MAX - MIN))
               onChange(next)
             }}
            style={{ accentColor: '#0f172a' }}
            className="w-full h-2 cursor-pointer"
          />
          <div className="flex justify-between mt-1">
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-xs text-slate-400">{MIN}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-xs text-slate-400">{MAX}</span>
          </div>
        </div>

        <button
          onClick={() => { playClick(); onBegin(value) }}
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="w-full px-8 py-3 rounded-xl font-semibold text-sm tracking-wide
                     bg-slate-900 text-white hover:bg-slate-700 transition-colors"
        >
          Begin →
        </button>
      </div>
    </div>
  )
}