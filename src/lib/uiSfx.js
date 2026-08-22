// uiSfx.js
// Real audio playback via the uisfx library (Zen feel pack), wrapped so the
// rest of the app keeps calling the same function names it always has —
// only the import path changes at each call site. Volume is still owned by
// sound.js's persisted sfxVolume; this module just mirrors that value into
// the uisfx engine.

import { createUISFX } from 'uisfx'
import { getSfxVolume, setSfxVolume as persistSfxVolume } from './sound'


// uisfx's own cues sit lower in perceived loudness than felt right for this
// game, so we boost before handing the value to the engine rather than
// changing what's stored/shown in the settings slider. A sub-1 exponent
// lifts quiet/mid settings more than it lifts the already-loud top end,
// so the curve stays audible across the whole range instead of just
// clipping everything above ~80% to the same volume.
const VOLUME_BOOST_CURVE = 0.6 // lower = louder boost; 1 = no boost

function boostedVolume(raw) {
  const clamped = Math.min(1, Math.max(0, raw))
  return Math.pow(clamped, VOLUME_BOOST_CURVE)
}

const ui = createUISFX({
  pack: 'zen',
  volume: boostedVolume(getSfxVolume()),
})

// Re-exported so callers (MusicMenu) don't need to import from two places.
export { getSfxVolume }

export function setSfxVolume(value) {
  persistSfxVolume(value)
  ui.setVolume(boostedVolume(value))
}

// ── One-shots, mapped from game action -> uisfx semantic event ──────────
export function playHover() {
  ui.play('hover', { cooldownMs: 70 }) // matches the old HOVER_THROTTLE_MS
}

export function playClick() {
  // Primary CTA confirm — Start Game, Begin, Play Again, Next Applicant,
  // Session Results, Submit.
  ui.play('select')
}

export function playToggleClick() {
  // Secondary/toggle actions — settings, mode toggle, modal close, Home,
  // End Session, add/remove list rows.
  ui.play('toggle-on')
}

export function playPickup() {
  // Picking up a drag chip.
  ui.play('drag-start')
}

export function playStamp() {
  // Committing a prediction — tap-cycle or drag-drop.
  ui.play('drop')
}

export function playReveal() {
  // Reveal-screen card flip.
  ui.play('open')
}

export function playCelebration() {
  // High session score.
  ui.play('achievement')
}

export function playConsolation() {
  // Low session score — the "outcome, not great" cue, paired with
  // playCelebration the same way the library pairs success/error.
  ui.play('error')
}

export function playSliderSnap(normalizedPosition = 0.5) {
  // Discrete session-length slider.
  ui.play('snap')
}

export function playSliderTick() {
  // Continuous volume sliders — quieter, retriggerable.
  ui.play('snap', { retrigger: 'restart', cooldownMs: 45 })
}

// Increasing-number animations (round score, session score, stat cards).
// These update on every requestAnimationFrame tick, so this needs a
// cooldown or it turns into 40+ calls per count-up — the cooldown here is
// wider than playSliderTick's since a counting number should read as a
// steady, sparse tick, not a fast rattle. Volume-gated up front since this
// fires far more often than any other cue in the game.
export function playCountTick() {
  if (getSfxVolume() <= 0) return
  ui.play('progress-step', { retrigger: 'restart', cooldownMs: 90 })
}

// ── Loop — the only ongoing-state sound in the game ──────────────────────
let loadingTask = null

export function startLoadingLoop() {
  if (loadingTask) return
  loadingTask = ui.play('processing')
}

export function stopLoadingLoop() {
  loadingTask?.stop()
  loadingTask = null
}