// music.js
// Background music — a single looping HTMLAudioElement, kept as a
// module-level singleton so React StrictMode's double-invoked effects
// never spin up two overlapping copies of the track. Volume is a float
// (0..1) persisted to localStorage, independent of the SFX volume in
// sound.js.
//
// Browsers block audio autoplay until the user has interacted with the
// page at least once. initMusic() attempts to play immediately; if that's
// blocked, a gesture watchdog listens for the first pointerdown/keydown/
// touchstart anywhere on the page and retries, then removes itself.

const STORAGE_KEY_VOLUME = 'musicVolume'
const DEFAULT_VOLUME = 0.5
const TRACK_SRC = '/audio/CGPM.mp3'

let audioEl = null
let gestureListenersAttached = false

function getAudioEl() {
  if (typeof window === 'undefined') return null
  if (!audioEl) {
    audioEl = new Audio(TRACK_SRC)
    audioEl.loop = true
    audioEl.volume = getMusicVolume()
  }
  return audioEl
}

export function getMusicVolume() {
  if (typeof window === 'undefined') return DEFAULT_VOLUME
  const stored = localStorage.getItem(STORAGE_KEY_VOLUME)
  return stored === null ? DEFAULT_VOLUME : Number(stored)
}

export function setMusicVolume(value) {
  if (typeof window === 'undefined') return
  const clamped = Math.min(1, Math.max(0, value))
  localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped))
  const el = getAudioEl()
  if (el) el.volume = clamped
}

function attemptPlay() {
  const el = getAudioEl()
  if (!el) return
  const playPromise = el.play()
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Blocked by autoplay policy — wait for the first user gesture.
      attachGestureWatchdog()
    })
  }
}

function attachGestureWatchdog() {
  if (gestureListenersAttached || typeof window === 'undefined') return
  gestureListenersAttached = true

  function retry() {
    const el = getAudioEl()
    if (!el) return
    el.play().then(removeListeners).catch(() => {
      // Still blocked — listeners stay attached for the next gesture.
    })
  }

  function removeListeners() {
    window.removeEventListener('pointerdown', retry)
    window.removeEventListener('keydown', retry)
    window.removeEventListener('touchstart', retry)
    gestureListenersAttached = false
  }

  window.addEventListener('pointerdown', retry)
  window.addEventListener('keydown', retry)
  window.addEventListener('touchstart', retry)
}

// Call once near the app root to kick off playback. Safe to call more than
// once (e.g. StrictMode) — repeat calls just re-attempt play() on the same
// singleton element rather than creating a duplicate.
export function initMusic() {
  if (typeof window === 'undefined') return
  attemptPlay()
}