// CollegeInfoButton.jsx
// A tap-to-open "i" icon that shows public/private status, admission rate,
// test scores, and enrollment for a school, pulled from college_scorecard.
// Renders nothing if the school has no match — better than a popup with a
// wrong or empty college in it.

import { useEffect, useRef, useState } from 'react'
import { getCollegeData, matchCollege } from '../lib/collegeData'
import { playToggleClick } from '../lib/uiSfx'

function InfoIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

const OWNERSHIP_STYLE = {
  'Public':              'bg-[#C8E6E2] text-slate-700',
  'Private nonprofit':   'bg-[#E8E4F3] text-slate-700',
  'Private for-profit':  'bg-[#F5EDD6] text-slate-700',
}

function formatPct(value) {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value * 100)}%`
}

function formatNumber(value) {
  if (value === null || value === undefined) return '—'
  return Number(value).toLocaleString()
}

export default function CollegeInfoButton({ schoolName, className = '' }) {
  const [college, setCollege] = useState(undefined) // undefined = still loading
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    getCollegeData().then(list => {
      if (!cancelled) setCollege(matchCollege(schoolName, list))
    })
    return () => { cancelled = true }
  }, [schoolName])

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  // Still loading, or no match found — no icon.
  if (!college) return null

  return (
    <span ref={containerRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          playToggleClick()
          setOpen(o => !o)
        }}
        aria-label={`About ${college.name}`}
        aria-expanded={open}
        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
      >
        <InfoIcon className="w-4 h-4" />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
                     w-60 bg-white rounded-xl border border-slate-200 shadow-lg p-4"
        >
          <p style={{ fontFamily: "'Playfair Display', serif" }}
             className="text-sm font-semibold text-slate-900 mb-1.5 leading-snug">
            {college.name}
          </p>
          {college.ownership && (
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide
                               px-2 py-0.5 rounded-full mb-3 ${OWNERSHIP_STYLE[college.ownership] ?? 'bg-slate-100 text-slate-600'}`}>
              {college.ownership}
            </span>
          )}
          <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Admit rate</span>
              <span className="font-semibold text-slate-900">{formatPct(college.admission_rate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Avg SAT</span>
              <span className="font-semibold text-slate-900">
                {college.sat_average === null || college.sat_average === undefined ? '—' : Math.round(college.sat_average)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Median ACT</span>
              <span className="font-semibold text-slate-900">{formatNumber(college.act_midpoint)}</span>
            </div>
          </div>
          {/* Little arrow pointing at the icon */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white
                           border-r border-b border-slate-200 rotate-45 -mt-1.5" />
        </div>
      )}
    </span>
  )
}