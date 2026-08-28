// consent.js
// Cookie/consent-category state, persisted to localStorage. Two categories:
// "necessary" (always on — required local-storage game settings) and
// "analytics" (GA4 — off until the player opts in). Cloudflare Web
// Analytics isn't tracked here: it's a cookieless, privacy-first beacon
// that never sets an identifier, so it isn't gated by consent.

const STORAGE_KEY = 'cookieConsent'

export function getStoredConsent() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return { necessary: true, analytics: Boolean(parsed.analytics) }
  } catch {
    return null
  }
}

// True once the player has made an explicit choice — used to decide
// whether the first-run banner should show at all.
export function hasConsentDecision() {
  return getStoredConsent() !== null
}

export function saveConsent(analytics) {
  if (typeof window === 'undefined') return
  const value = { necessary: true, analytics: Boolean(analytics) }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  applyConsentToGtag(value)
  return value
}

// Pushes the decision into Google's Consent Mode. gtag() is defined
// inline in index.html before this module ever runs, so it's always
// available — the guard just keeps this safe if that script is ever
// blocked or missing.
export function applyConsentToGtag(consent) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
  })
}

// Re-applies whatever was already decided on a previous visit — call once
// on app boot so returning players' "granted" choice takes effect right
// away instead of sitting denied until they touch the banner again.
export function reapplyStoredConsent() {
  const stored = getStoredConsent()
  if (stored) applyConsentToGtag(stored)
}