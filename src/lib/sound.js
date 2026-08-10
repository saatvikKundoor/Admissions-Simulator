// sound.js
// Tiny, dependency-free sound effects synthesized with the Web Audio API.
// No audio files to fetch or ship — everything here is generated at
// playback time. Five effect families:
//   - playStamp()       — a percussive "thud" for a prediction/decision moment
//   - playPickup()      — a soft paper "whoosh" for picking up a drag chip
//   - playReveal()       — a card-flip flourish for each reveal-screen row
//   - playCelebration() — a bright ascending chime when a high session score lands
//   - playConsolation() — a soft, muted thud when a low session score lands
//
// SFX volume is a float (0..1) persisted to localStorage. Every effect
// reads it fresh each call and scales its peak/attack gain values by it —
// near-zero decay targets are left alone since they're inaudible
// regardless of volume. A volume of 0 behaves like the old "sound off".

const STORAGE_KEY_VOLUME = 'sfxVolume'
const DEFAULT_VOLUME = 0.7

let lastHoverTime = 0
const HOVER_THROTTLE_MS = 200
let ctx = null

function getContext() {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!ctx) ctx = new AudioCtx()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function jitter(value, amount = 0.08) {
  return value * (1 + (Math.random() * 2 - 1) * amount)
}

export function getSfxVolume() {
  if (typeof window === 'undefined') return DEFAULT_VOLUME
  const stored = localStorage.getItem(STORAGE_KEY_VOLUME)
  return stored === null ? DEFAULT_VOLUME : Number(stored)
}

export function setSfxVolume(value) {
  if (typeof window === 'undefined') return
  const clamped = Math.min(1, Math.max(0, value))
  localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped))
}

export function playStamp() {
  const volume = getSfxVolume()
  if (volume <= 0) return
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime

  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(jitter(190), now)
  osc.frequency.exponentialRampToValueAtTime(jitter(55), now + 0.13)

  const peakGain = jitter(0.3, 0.12) * volume
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.003)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17)

  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.18)

  const bufferSize = Math.floor(audioCtx.sampleRate * 0.025)
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }

  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer

  const noiseGain = audioCtx.createGain()
  noiseGain.gain.setValueAtTime(0, now)
  noiseGain.gain.linearRampToValueAtTime(0.18 * volume, now + 0.002)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025)

  noise.connect(noiseGain)
  noiseGain.connect(audioCtx.destination)

  noise.start(now)
  noise.stop(now + 0.026)
}

export function playPickup() {
  const volume = getSfxVolume()
  if (volume <= 0) return
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime

  const bufferSize = Math.floor(audioCtx.sampleRate * 0.15)
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer

  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(1100, now)
  filter.frequency.exponentialRampToValueAtTime(2400, now + 0.15)
  filter.Q.value = 0.7

  const gain = audioCtx.createGain()
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.12 * volume, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(audioCtx.destination)
  noise.start(now)
}

// A soft, subtle click for hover-enter feedback on school rows/chips.
export function playHover() {
  const volume = getSfxVolume()
  if (volume <= 0) return
  const nowMs = Date.now()
  if (nowMs - lastHoverTime < HOVER_THROTTLE_MS) return
  lastHoverTime = nowMs

  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime

  const bufferSize = Math.floor(audioCtx.sampleRate * 0.02)
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer

  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(jitter(2200), now)
  filter.Q.value = 1.2

  const gain = audioCtx.createGain()
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(jitter(0.09, 0.15) * volume, now + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(audioCtx.destination)
  noise.start(now)
}

// A bright, short confirm click for primary CTAs.
export function playClick() {
  const volume = getSfxVolume()
  if (volume <= 0) return
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime

  const bufferSize = Math.floor(audioCtx.sampleRate * 0.02)
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer
  const noiseFilter = audioCtx.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.setValueAtTime(jitter(1100), now)
  noiseFilter.Q.value = 0.9
  const noiseGain = audioCtx.createGain()
  noiseGain.gain.setValueAtTime(jitter(0.1, 0.15) * volume, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)
  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(audioCtx.destination)
  noise.start(now)

  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(jitter(340), now)
  osc.frequency.exponentialRampToValueAtTime(jitter(200), now + 0.06)
  gain.gain.setValueAtTime(jitter(0.2, 0.12) * volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.07)
}

// A quieter, drier click for secondary/toggle actions — sound toggle,
// mode toggle, modal close, End Session, Home. Deliberately lower-pitched
// and shorter than playClick so the hierarchy between "confirming
// something" and "flipping a switch" is audible, not just visual.
//
// Same noise-only texture as before (no tonal body, unlike playClick) —
// just louder and slightly longer, since at its old gain (peak 0.08) it
// was getting buried under background music even at max SFX volume.
export function playToggleClick() {
  const volume = getSfxVolume()
  if (volume <= 0) return
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime

  const bufferSize = Math.floor(audioCtx.sampleRate * 0.018)
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer
  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(jitter(1300), now)
  filter.Q.value = 1.4
  const gain = audioCtx.createGain()
  gain.gain.setValueAtTime(jitter(0.2, 0.15) * volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)
  noise.connect(filter)
  filter.connect(gain)
  gain.connect(audioCtx.destination)
  noise.start(now)
}
// A card-flip sound for reveal-screen rows.
export function playReveal() {
  const volume = getSfxVolume()
  if (volume <= 0) return
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime

  const flipDuration = 0.09
  const bufferSize = Math.floor(audioCtx.sampleRate * flipDuration)
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer

  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(3200, now)
  filter.frequency.exponentialRampToValueAtTime(900, now + flipDuration)
  filter.Q.value = 1.1

  const gain = audioCtx.createGain()
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.22 * volume, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, now + flipDuration)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(audioCtx.destination)
  noise.start(now)

  const snapStart = now + flipDuration - 0.01
  const snap = audioCtx.createOscillator()
  const snapGain = audioCtx.createGain()
  snap.type = 'triangle'
  snap.frequency.setValueAtTime(1800, snapStart)
  snapGain.gain.setValueAtTime(0.12 * volume, snapStart)
  snapGain.gain.exponentialRampToValueAtTime(0.001, snapStart + 0.03)
  snap.connect(snapGain)
  snapGain.connect(audioCtx.destination)
  snap.start(snapStart)
  snap.stop(snapStart + 0.03)
}

// A bright, three-note ascending chime for a high session score.
export function playCelebration() {
  const volume = getSfxVolume()
  if (volume <= 0) return
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const notes = [523.25, 659.25, 783.99] // C5, E5, G5

  notes.forEach((freq, i) => {
    const start = now + i * 0.09
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, start)
    gain.gain.setValueAtTime(0.001, start)
    gain.gain.linearRampToValueAtTime(0.18 * volume, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(start)
    osc.stop(start + 0.3)
  })
}

// A soft, muted thud for a low session score.
export function playConsolation() {
  const volume = getSfxVolume()
  if (volume <= 0) return
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime

  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(220, now)
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.26)
  gain.gain.setValueAtTime(0.22 * volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.33)

  const bufferSize = Math.floor(audioCtx.sampleRate * 0.03)
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer
  const noiseGain = audioCtx.createGain()
  noiseGain.gain.setValueAtTime(0.06 * volume, now)
  noise.connect(noiseGain)
  noiseGain.connect(audioCtx.destination)
  noise.start(now)
}