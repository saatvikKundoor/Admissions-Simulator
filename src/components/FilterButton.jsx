// FilterButton.jsx
// A funnel button, styled to match MusicMenu's button, with a badge showing
// how many filter categories are active. Opens FilterModal on click.

import { useState } from 'react'
import { playToggleClick } from '../lib/uiSfx'
import FilterModal from './FilterModal'
import { countActiveFilters } from '../lib/filterData'

function FunnelIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
    </svg>
  )
}

export default function FilterButton({ filters, onChange }) {
  const [open, setOpen] = useState(false)
  const activeCount = countActiveFilters(filters)

  return (
    <>
      <button
        onClick={() => { playToggleClick(); setOpen(true) }}
        aria-label="Filter applicants"
        aria-expanded={open}
        className="relative p-2.5 rounded-lg border border-slate-300 bg-white
                   text-slate-600 hover:bg-slate-50 transition-colors
                   inline-flex items-center justify-center"
      >
        <FunnelIcon className="w-5 h-5" />
        {activeCount > 0 && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
                className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full
                           bg-slate-900 text-white text-[10px] font-semibold
                           flex items-center justify-center leading-none">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <FilterModal
          filters={filters}
          onChange={onChange}
          onClose={() => { playToggleClick(); setOpen(false) }}
        />
      )}
    </>
  )
}