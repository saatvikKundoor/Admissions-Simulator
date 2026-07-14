// sound.js
// Tiny, dependency-free sound effects synthesized with the Web Audio API.
// No audio files to fetch or ship — everything here is generated at
// playback time. Two effects:
//   - playStamp()  — a percussive "thud" for a prediction/decision moment
//   - playPickup() — a soft paper "whoosh" for picking up a drag chip
//
// Both effects check the shared, localStorage-backed mute setting internally,
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