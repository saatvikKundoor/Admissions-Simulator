// sound.js
// Tiny, dependency-free sound effects synthesized with the Web Audio API.
// No audio files to fetch or ship — everything here is generated at
// playback time. Five effects:
//   - playStamp()       — a percussive "thud" for a prediction/decision moment
//   - playPickup()      — a soft paper "whoosh" for picking up a drag chip
//   - playReveal()       — a card-flip flourish for each reveal-screen row
//   - playCelebration() — a bright ascending chime when a high session score lands
//   - playConsolation() — a soft, muted thud when a low session score lands
//
// All effects check the shared, localStorage-backed mute setting internally,
// so any component can call them directly without re-checking first.

const STORAGE_KEY = 'soundEnabled'

let ctx = null

function getContext() {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!ctx) ctx = new AudioCtx()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function isSoundEnabled() {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === null ? true : stored === 'true'
}

export function setSoundEnabled(enabled) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, String(enabled))
}

export function playStamp() {
  if (!isSoundEnabled()) return
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime

  // Low percussive thud — the "stamp hitting paper" body
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(190, now)
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.13)
  gain.gain.setValueAtTime(0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.18)

  // Short burst of filtered noise layered on top for the stamp's "snap"
  const bufferSize = Math.floor(audioCtx.sampleRate * 0.025)
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer
  const noiseGain = audioCtx.createGain()
  noiseGain.gain.setValueAtTime(0.18, now)
  noise.connect(noiseGain)
  noiseGain.connect(audioCtx.destination)
  noise.start(now)
}

export function playPickup() {
  if (!isSoundEnabled()) return
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
  gain.gain.linearRampToValueAtTime(0.12, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(audioCtx.destination)
  noise.start(now)
}

// A card-flip sound — a short burst of noise swept from high to low frequency
// (the rustle of the card turning through the air), followed by a bright
// snap right as it settles (the card landing flat). Distinct from the deep
// stamp thud so a run of reveals feels like cards turning, not repeated hits.
export function playReveal() {
  if (!isSoundEnabled()) return
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime

  // Layer 1 — the flip: filtered noise swept from high to low frequency,
  // like a card rotating through the air
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
  gain.gain.linearRampToValueAtTime(0.22, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, now + flipDuration)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(audioCtx.destination)
  noise.start(now)

  // Layer 2 — the landing: a short, bright snap right as the flip settles
  const snapStart = now + flipDuration - 0.01
  const snap = audioCtx.createOscillator()
  const snapGain = audioCtx.createGain()
  snap.type = 'triangle'
  snap.frequency.setValueAtTime(1800, snapStart)
  snapGain.gain.setValueAtTime(0.12, snapStart)
  snapGain.gain.exponentialRampToValueAtTime(0.001, snapStart + 0.03)
  snap.connect(snapGain)
  snapGain.connect(audioCtx.destination)
  snap.start(snapStart)
  snap.stop(snapStart + 0.03)
}

// A bright, three-note ascending chime — the celebratory flourish when a
// high session score lands.
export function playCelebration() {
  if (!isSoundEnabled()) return
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
    gain.gain.linearRampToValueAtTime(0.18, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(start)
    osc.stop(start + 0.3)
  })
}

// A soft, muted thud — a gentler, lower-key sibling to playStamp(), used as
// a subdued acknowledgment when a low session score lands.
export function playConsolation() {
  if (!isSoundEnabled()) return
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime

  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(140, now)
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.22)
  gain.gain.setValueAtTime(0.16, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.27)
}