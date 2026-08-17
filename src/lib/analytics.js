// analytics.js
// Thin wrapper around gtag() so event names and param shapes live in one
// place instead of scattered across components. No-ops safely if gtag
// hasn't loaded (ad blockers, local dev without the script tag).

function gtagSafe(...args) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag(...args)
}

export function trackStartGameClick() {
  gtagSafe('event', 'start_game_click')
}

export function trackGameSessionStart(sessionLength) {
  gtagSafe('event', 'game_session_start', { session_length: sessionLength })
}

export function trackLevelStart(roundNumber) {
  gtagSafe('event', 'level_start', { level_name: `round_${roundNumber}` })
}

export function trackLevelEnd(roundNumber, correct, total) {
  gtagSafe('event', 'level_end', {
    level_name: `round_${roundNumber}`,
    success: total > 0 && correct / total >= 0.5,
  })
}

export function trackPostScore(roundNumber, correct) {
  gtagSafe('event', 'post_score', { level: roundNumber, score: correct })
}

export function trackGameSessionComplete({ correct, total, profileCount, endedEarly }) {
  gtagSafe('event', 'game_session_complete', {
    correct,
    total,
    profile_count: profileCount,
    ended_early: endedEarly,
  })
}