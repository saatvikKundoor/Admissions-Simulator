// SessionSetupModal.jsx
// Shown after "Start Game" on the landing page, before the first profile
// fetches. Lets the player pick how many applicants they want in this
// session (1-20, default 5). Closing via the X reveals the landing page
// again without starting the game.

import { useEffect } from 'react'
import { playClick, playToggleClick, playSliderSnap } from '../lib/uiSfx'
import FilterButton from './FilterButton'

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
const HARD_MAX = 20

export default function SessionSetupModal({ value, onChange, onClose, onBegin, maxApplicants, filters, onFiltersChange }) {
  const noMatches = maxApplicants === 0
  const max = Math.max(MIN, Math.min(HARD_MAX, maxApplicants ?? HARD_MAX))
  const clampedValue = Math.min(value, max)

  // Keep the parent's session length in sync if a filter change shrinks
  // the pool below the previously chosen value.
  useEffect(() => {
    if (!noMatches && value > max) onChange(max)
  }, [max, value, noMatches, onChange])
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

        <div className="flex items-center gap-3 mb-2 pr-8">
          <FilterButton filters={filters} onChange={onFiltersChange} />
          <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
             className="text-slate-400 text-xs uppercase tracking-widest">
            Session length
          </p>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-2xl font-semibold text-slate-900 mb-6">
          How many applicants?
        </h2>

        {noMatches ? (
          <div className="mb-8 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">No applicants match your filters. Try widening them.</p>
          </div>
        ) : (
        <div className="mb-8">
          <p style={{ fontFamily: "'Playfair Display', serif" }}
             className="text-5xl font-semibold text-slate-900 text-center mb-4">
            {clampedValue}
          </p>
          <input
            type="range"
            min={MIN}
            max={max}
            step={1}
            value={clampedValue}
            onChange={(e) => {
               const next = Number(e.target.value)
               if (next !== clampedValue) playSliderSnap((next - MIN) / (max - MIN || 1))
               onChange(next)
             }}
            style={{ accentColor: '#0f172a' }}
            className="w-full h-2 cursor-pointer"
          />
          <div className="flex justify-between mt-1">
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-xs text-slate-400">{MIN}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-xs text-slate-400">{max}</span>
          </div>
          {typeof maxApplicants === 'number' && (
            <p className="text-xs text-slate-400 text-center mt-2">
              {maxApplicants} applicant{maxApplicants !== 1 ? 's' : ''} match your filters
            </p>
          )}
        </div>
        )}

        <button
          onClick={() => { playClick(); onBegin(clampedValue) }}
          disabled={noMatches}
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="w-full px-8 py-3 rounded-xl font-semibold text-sm tracking-wide transition-colors
                     bg-slate-900 text-white hover:bg-slate-700
                     disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Begin →
        </button>
      </div>
    </div>
  )
}