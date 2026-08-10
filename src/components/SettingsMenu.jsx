// SettingsMenu.jsx
// Replaces the old binary sound on/off toggle. A gear button opens a small
// dropdown with two independent volume sliders — SFX and Music — backed by
// sound.js / music.js respectively. Renders identically wherever it's
// placed (landing page, game header, session end) so volume can be
// adjusted from any screen.

import { useEffect, useRef, useState } from 'react'
import { getSfxVolume, setSfxVolume, playToggleClick } from '../lib/sound'
import { getMusicVolume, setMusicVolume } from '../lib/music'

function SettingsIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function VolumeSlider({ label, value, onChange }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="text-xs text-slate-500 uppercase tracking-wide">
          {label}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="text-xs text-slate-400">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: '#0f172a' }}
        className="w-full h-1.5 cursor-pointer"
      />
    </div>
  )
}

export default function SettingsMenu() {
  const [open, setOpen]   = useState(false)
  const [sfx, setSfx]     = useState(() => Math.round(getSfxVolume() * 100))
  const [music, setMusic] = useState(() => Math.round(getMusicVolume() * 100))
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleSfxChange(next) {
    setSfx(next)
    setSfxVolume(next / 100)
  }

  function handleMusicChange(next) {
    setMusic(next)
    setMusicVolume(next / 100)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => { playToggleClick(); setOpen(o => !o) }}
        aria-label="Settings"
        aria-expanded={open}
        className="p-2 rounded-lg border border-slate-300 bg-white
                   text-slate-600 hover:bg-slate-50 transition-colors
                   inline-flex items-center justify-center"
      >
        <SettingsIcon className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-[#F2F0EB] rounded-xl border
                         border-slate-200 shadow-lg p-4 z-50">
          <VolumeSlider label="Sound Effects" value={sfx}   onChange={handleSfxChange} />
          <VolumeSlider label="Music"         value={music} onChange={handleMusicChange} />
        </div>
      )}
    </div>
  )
}