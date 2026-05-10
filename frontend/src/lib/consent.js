// Cookie / similar-storage consent management for Fanvora.
//
// Why the version matters: when we add new cookie categories or materially
// change our Cookie Policy we bump CONSENT_VERSION, which makes the banner
// reappear so users can review and re-consent. GDPR + ePrivacy require fresh
// consent for material changes.

const STORAGE_KEY = 'fanvora-cookie-consent'
export const CONSENT_VERSION = '1.0'

// 12 months — once consent expires we ask again, per ICO / EDPB guidance.
const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000

const DEFAULT_CONSENT = {
  essential: true,   // always on, can't be toggled off
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
  updatedAt: null
}

// Read the user's stored preferences, or return defaults if none / expired /
// stale-version. Pure function — safe to call before the banner mounts.
export function getConsent() {
  if (typeof window === 'undefined') return DEFAULT_CONSENT
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONSENT
    const parsed = JSON.parse(raw)
    if (parsed.version !== CONSENT_VERSION) return DEFAULT_CONSENT
    if (parsed.updatedAt && Date.now() - new Date(parsed.updatedAt).getTime() > CONSENT_TTL_MS) {
      return DEFAULT_CONSENT
    }
    return { ...DEFAULT_CONSENT, ...parsed }
  } catch {
    return DEFAULT_CONSENT
  }
}

// True only if the user has actively made a choice on the current version.
// Used to decide whether to show the banner.
export function hasGivenConsent() {
  if (typeof window === 'undefined') return true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    if (parsed.version !== CONSENT_VERSION) return false
    if (!parsed.updatedAt) return false
    return Date.now() - new Date(parsed.updatedAt).getTime() <= CONSENT_TTL_MS
  } catch {
    return false
  }
}

// Persist a new set of preferences and broadcast a window event so any
// listening modules (e.g. an analytics loader) can react in the same tab.
export function setConsent(prefs) {
  if (typeof window === 'undefined') return
  const next = {
    ...DEFAULT_CONSENT,
    ...prefs,
    essential: true, // can never be toggled off
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('fanvora:consent-changed', { detail: next }))
}

// Convenience used by the "Open cookie preferences" link in the footer and
// in the Cookie Policy page. The banner component listens for this event.
export function openCookiePreferences() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('fanvora:open-cookie-preferences'))
}
