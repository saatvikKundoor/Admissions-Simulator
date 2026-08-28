// CookieBanner.jsx
// First-run consent bar, fixed to the bottom of the viewport. Collapsed by
// default (message + Accept/Reject/Customize); "Customize" expands the
// same category toggles used in CookiePreferencesModal in place, so there's
// no second popup stacked on top of the banner itself.

import { useState } from 'react'
import { saveConsent } from '../lib/consent'
import { playClick, playToggleClick } from '../lib/uiSfx'
import CookieToggleList from './CookieToggleList'

export default function CookieBanner({ onDecided }) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState({ necessary: true, analytics: false })

  function acceptAll() {
    playClick()
    saveConsent(true)
    onDecided()
  }

  function rejectNonEssential() {
    playToggleClick()
    saveConsent(false)
    onDecided()
  }

  function savePreferences() {
    playClick()
    saveConsent(draft.analytics)
    onDecided()
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[100] px-2 pb-2 sm:px-3 sm:pb-3"
    >
      <div className="w-full bg-[#F2F0EB] border border-slate-200 rounded-2xl shadow-2xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
          {/* Message — takes remaining width on desktop instead of stacking full-height */}
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
               className="text-slate-400 text-xs uppercase tracking-widest mb-1">
              A quick note before you play
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif" }}
               className="text-sm text-slate-700 leading-relaxed">
              We use a small amount of browser storage to run the game, and Google Analytics cookies (which are anonymized) to see how the game is being played.
            </p>
          </div>

        {/* Buttons — beside the text on desktop, below it on mobile */}
          <div className="flex flex-row xs:flex-col lg:items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => { playToggleClick(); setExpanded(e => !e) }}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="text-xs text-slate-400 hover:text-slate-600 uppercase tracking-widest
                         transition-colors text-left lg:text-center px-1 shrink-0"
            >
              {expanded ? 'Hide options' : 'Customize'}
            </button>
            <button
              onClick={rejectNonEssential}
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-colors
                         border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 shrink-0"
            >
              Reject non-essential
            </button>
            {expanded ? (
              <button
                onClick={savePreferences}
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-colors
                           bg-slate-900 text-white hover:bg-slate-700 shrink-0"
              >
                Save preferences
              </button>
            ) : (
              <button
                onClick={acceptAll}
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-colors
                           bg-slate-900 text-white hover:bg-slate-700 shrink-0"
              >
                Accept all
              </button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-black/10">
            <CookieToggleList
              draft={draft}
              onToggle={(key, value) => setDraft(prev => ({ ...prev, [key]: value }))}
            />
          </div>
        )}
      </div>
    </div>
  )
}