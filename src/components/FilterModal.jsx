// FilterModal.jsx
// Multi-select sections (colleges / major / ethnicity / residence) plus
// min/max range inputs (SAT / ACT / GPA). Edits happen on a local draft so
// closing without hitting Apply doesn't change anything. Filters aren't
// persisted to localStorage — they reset on every visit, by design.

import { useEffect, useRef, useState } from 'react'
import { getFilterData, getMatchingProfileIds, DEFAULT_FILTERS } from '../lib/filterData'
import { playToggleClick } from '../lib/uiSfx'

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

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

const SECTION_COLORS = {
  lavender: 'bg-[#E8E4F3]',
  cream:    'bg-[#F5EDD6]',
  sky:      'bg-[#D4EAF5]',
  teal:     'bg-[#C8E6E2]',
}

function SectionCard({ title, color, children }) {
  return (
    <div className={`rounded-2xl p-5 ${SECTION_COLORS[color] ?? 'bg-slate-100'}`}>
      <h3 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-lg font-semibold text-slate-800 mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}

function MultiSelectSection({ title, color, options, selected, onToggle, searchPlaceholder }) {
  const [search, setSearch] = useState('')
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  return (
    <SectionCard title={title} color={color}>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selected.map(value => (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full
                         bg-slate-900 text-white hover:bg-slate-700 transition-colors"
            >
              {value}
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white/70 text-sm
                   text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 mb-2"
      />
      <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
        {filtered.length === 0 && <p className="text-xs text-slate-400 py-1">No matches</p>}
        {filtered.map(option => (
          <label key={option} className="flex items-center gap-2 text-sm text-slate-700 py-0.5 cursor-pointer">
            <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />
            <span className="truncate">{option}</span>
          </label>
        ))}
      </div>
    </SectionCard>
  )
}

function RangeSection({ title, color, min, max, step, minValue, maxValue, onMinChange, onMaxChange }) {
  const inputClass = "w-full px-3 py-2 rounded-lg border border-black/10 bg-white/70 text-sm " +
                      "text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
  return (
    <SectionCard title={title} color={color}>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">Min</span>
          <input type="number" min={min} max={max} step={step} placeholder={String(min)}
                 value={minValue ?? ''}
                 onChange={(e) => onMinChange(e.target.value === '' ? null : Number(e.target.value))}
                 className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">Max</span>
          <input type="number" min={min} max={max} step={step} placeholder={String(max)}
                 value={maxValue ?? ''}
                 onChange={(e) => onMaxChange(e.target.value === '' ? null : Number(e.target.value))}
                 className={inputClass} />
        </label>
      </div>
    </SectionCard>
  )
}


export default function FilterModal({ filters, onChange, onClose }) {
  const [draft, setDraft] = useState(filters)
  const [filterData, setFilterData] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    getFilterData().then(data => { if (!cancelled) setFilterData(data) })
    return () => { cancelled = true }
  }, [])

  // Every close path (X, backdrop, Escape) saves the current draft — there's
  // no separate Apply step, so leaving the popup is what commits filters.
  function requestClose() {
    onChange(draft)
    onClose()
  }

  // Focus trap + initial focus. Re-runs once filterData resolves, since the
  // modal renders a "Loading filter options…" line first with almost no
  // focusable content, then swaps in the full form — the trap needs to
  // recheck the focusable set after that swap, not just on mount.
  useEffect(() => {
    const modalEl = modalRef.current
    if (!modalEl) return

    const getFocusable = () => Array.from(modalEl.querySelectorAll(FOCUSABLE_SELECTOR))
    getFocusable()[0]?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        requestClose()
        return
      }
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [draft, filterData])

  const matchCount = filterData ? getMatchingProfileIds(filterData, draft).length : null

  function toggleValue(key, value) {
    setDraft(prev => {
      const list = prev[key]
      const next = list.includes(value) ? list.filter(v => v !== value) : [...list, value]
      return { ...prev, [key]: next }
    })
  }

  function handleClear() {
    playToggleClick()
    setDraft(DEFAULT_FILTERS)
  }

  return (
    <div onClick={requestClose} className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-slate-900/50 backdrop-blur-sm">
      <div ref={modalRef} onClick={(e) => e.stopPropagation()}
           role="dialog" aria-modal="true" aria-label="Filter applicants"
           className="relative bg-[#F2F0EB] rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <button onClick={requestClose} aria-label="Close"
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10">
          <XIcon className="w-5 h-5" />
        </button>

        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
           className="text-slate-400 text-xs uppercase tracking-widest mb-2">
          Narrow the pool
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-3xl font-semibold text-slate-900 mb-6">
          Filter Applicants
        </h2>

        {!filterData ? (
          <p className="text-sm text-slate-400">Loading filter options…</p>
        ) : (
          <div className="space-y-4">
            <MultiSelectSection title="Colleges" color="sky"
              options={filterData.options.colleges} selected={draft.colleges}
              onToggle={(v) => toggleValue('colleges', v)} searchPlaceholder="Search colleges…" />

            <MultiSelectSection title="Intended Major" color="lavender"
              options={filterData.options.majors} selected={draft.majors}
              onToggle={(v) => toggleValue('majors', v)} searchPlaceholder="Search majors…" />

            <MultiSelectSection title="Ethnicity" color="teal"
              options={filterData.options.ethnicities} selected={draft.ethnicities}
              onToggle={(v) => toggleValue('ethnicities', v)} searchPlaceholder="Search ethnicities…" />

            <MultiSelectSection title="Residence" color="cream"
              options={filterData.options.residences} selected={draft.residences}
              onToggle={(v) => toggleValue('residences', v)} searchPlaceholder="Search states / countries…" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <RangeSection title="SAT" color="sky" min={400} max={1600} step={10}
                minValue={draft.satMin} maxValue={draft.satMax}
                onMinChange={(v) => setDraft(prev => ({ ...prev, satMin: v }))}
                onMaxChange={(v) => setDraft(prev => ({ ...prev, satMax: v }))} />
              <RangeSection title="ACT" color="lavender" min={1} max={36} step={1}
                minValue={draft.actMin} maxValue={draft.actMax}
                onMinChange={(v) => setDraft(prev => ({ ...prev, actMin: v }))}
                onMaxChange={(v) => setDraft(prev => ({ ...prev, actMax: v }))} />
              <RangeSection title="GPA (Unw.)" color="teal" min={0} max={4} step={0.1}
                minValue={draft.gpaMin} maxValue={draft.gpaMax}
                onMinChange={(v) => setDraft(prev => ({ ...prev, gpaMin: v }))}
                onMaxChange={(v) => setDraft(prev => ({ ...prev, gpaMax: v }))} />
            </div>
          </div>
        )}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button onClick={handleClear} style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-xs text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
            Clear all
          </button>
          {filterData && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-xs text-slate-500">
              {matchCount} applicant{matchCount !== 1 ? 's' : ''} match{matchCount === 1 ? 'es' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}