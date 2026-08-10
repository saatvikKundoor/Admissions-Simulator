// SettingsMenu.jsx
// Replaces the old binary sound on/off toggle. A gear button opens a small
// dropdown with two independent volume sliders — SFX and Music — backed by
// sound.js / music.js respectively. Renders identically wherever it's
// placed (landing page, game header, session end) so volume can be
// adjusted from any screen.

import { useEffect, useRef, useState } from 'react'
import { getSfxVolume, setSfxVolume, playToggleClick, playSliderTick } from '../lib/sound'
import { getMusicVolume, setMusicVolume } from '../lib/music'

function MusicIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

function VolumeXIcon({ className, strokeWidth = 2 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
      <line x1="22" x2="16" y1="9" y2="15" />
      <line x1="16" x2="22" y1="9" y2="15" />
    </svg>
  )
}
 
function Volume2Icon({ className, strokeWidth = 2 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
      <path d="M16 9a5 5 0 0 1 0 6" />
      <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
    </svg>
  )
}

function VolumeSlider({ label, value, onChange }) {
  function handleChange(next) {
     // Quantize to every 4 points so a fast drag doesn't fire a tick per
     // percent — 25 ticks across the full range feels continuous without
     // spamming the ear.
     if (Math.floor(next / 4) !== Math.floor(value / 4)) {
       playSliderTick()
     }
     onChange(next)
   }

  const isMuted = value === 0

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
      <div className="flex items-center gap-2">
        <VolumeXIcon
          className={`shrink-0 transition-colors ${isMuted ? 'w-4.5 h-4.5 text-slate-900' : 'w-4 h-4 text-slate-300'}`}
          strokeWidth={isMuted ? 2.5 : 2}
        />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          style={{ accentColor: '#0f172a' }}
          className="flex-1 h-1.5 cursor-pointer"
        />
        <Volume2Icon
          className={`shrink-0 transition-colors ${!isMuted ? 'w-4.5 h-4.5 text-slate-900' : 'w-4 h-4 text-slate-300'}`}
          strokeWidth={!isMuted ? 2.5 : 2}
        />
      </div>
    </div>
  )
}

export default function MusicMenu() {
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
        aria-label="Sound Settings"
        aria-expanded={open}
        className="p-2 rounded-lg border border-slate-300 bg-white
                   text-slate-600 hover:bg-slate-50 transition-colors
                   inline-flex items-center justify-center"
      >
        <MusicIcon className="w-4 h-4" />
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
