// CookiePreferencesModal.jsx
// Same category toggles as CookieBanner, presented as a modal — opened
// later from a "Cookie Settings" link (landing page footer, privacy
// policy page) once the first-run banner has already been dismissed.

import { useEffect, useRef, useState } from 'react'
import { getStoredConsent, saveConsent } from '../lib/consent'
import { playClick, playToggleClick } from '../lib/uiSfx'
import CookieToggleList from './CookieToggleList'

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

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function CookiePreferencesModal({ onClose }) {
  const stored = getStoredConsent()
  const [draft, setDraft] = useState({
    necessary: true,
    analytics: stored?.analytics ?? false,
  })
  const modalRef = useRef(null)

  useEffect(() => {
    const modalEl = modalRef.current
    if (!modalEl) return
    const getFocusable = () => Array.from(modalEl.querySelectorAll(FOCUSABLE_SELECTOR))
    getFocusable()[0]?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSave() {
    playClick()
    saveConsent(draft.analytics)
    onClose()
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 bg-slate-900/50 backdrop-blur-sm">
      <div ref={modalRef} onClick={(e) => e.stopPropagation()}
           role="dialog" aria-modal="true" aria-label="Cookie settings"
           className="relative bg-[#F2F0EB] rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
        <button onClick={() => { playToggleClick(); onClose() }} aria-label="Close"
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <XIcon className="w-5 h-5" />
        </button>

        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
           className="text-slate-400 text-xs uppercase tracking-widest mb-2">
          Privacy
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-2xl font-semibold text-slate-900 mb-4">
          Cookie Settings
        </h2>

        <CookieToggleList
          draft={draft}
          onToggle={(key, value) => setDraft(prev => ({ ...prev, [key]: value }))}
        />

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm tracking-wide
                       bg-slate-900 text-white hover:bg-slate-700 transition-colors"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  )
}