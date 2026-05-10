import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X, Shield, BarChart3, Megaphone } from 'lucide-react'
import { getConsent, hasGivenConsent, setConsent } from '../lib/consent'

// Sticky bottom banner with three primary actions (Accept all / Reject all /
// Customize) plus a customize modal that exposes per-category toggles.
//
// The banner is rendered globally from <App />. It self-suppresses once a
// valid, in-version consent record exists. Re-opening is triggered by the
// "Open cookie preferences" link in the footer, which dispatches a
// `fanvora:open-cookie-preferences` event.
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [prefs, setPrefs] = useState(() => getConsent())

  useEffect(() => {
    setShowBanner(!hasGivenConsent())
    const openHandler = () => setShowCustomize(true)
    window.addEventListener('fanvora:open-cookie-preferences', openHandler)
    return () => window.removeEventListener('fanvora:open-cookie-preferences', openHandler)
  }, [])

  const acceptAll = () => {
    setConsent({ essential: true, analytics: true, marketing: true })
    setPrefs(getConsent())
    setShowBanner(false)
    setShowCustomize(false)
  }

  const rejectNonEssential = () => {
    setConsent({ essential: true, analytics: false, marketing: false })
    setPrefs(getConsent())
    setShowBanner(false)
    setShowCustomize(false)
  }

  const savePrefs = () => {
    setConsent(prefs)
    setShowBanner(false)
    setShowCustomize(false)
  }

  return (
    <>
      {showBanner && !showCustomize && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto"
        >
          <div className="glass rounded-2xl border border-primary-light/30 shadow-2xl shadow-black/50 p-5">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/20 items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-primary-light" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading text-lg font-bold text-white mb-1">
                  We value your privacy
                </h2>
                <p className="text-sm text-gray-300 mb-4">
                  Fanvora uses essential cookies to keep you signed in and to remember your
                  preferences. With your consent we may also use analytics and marketing
                  cookies. See our{' '}
                  <Link to="/legal/cookies" className="text-primary-light hover:text-accent underline">
                    Cookie Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/legal/privacy" className="text-primary-light hover:text-accent underline">
                    Privacy Policy
                  </Link>{' '}
                  for details. You can change your choice at any time.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={acceptAll} className="btn-primary text-sm py-2 px-4">
                    Accept all
                  </button>
                  <button onClick={rejectNonEssential} className="btn-secondary text-sm py-2 px-4">
                    Reject non-essential
                  </button>
                  <button
                    onClick={() => setShowCustomize(true)}
                    className="text-sm py-2 px-4 text-gray-300 hover:text-white transition-colors"
                  >
                    Customize
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCustomize && (
        <div
          className="modal-overlay"
          onClick={() => { if (hasGivenConsent()) setShowCustomize(false) }}
          role="dialog"
          aria-modal="true"
          aria-label="Cookie preferences"
        >
          <div className="modal-content max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold">Cookie preferences</h2>
              {hasGivenConsent() && (
                <button
                  onClick={() => setShowCustomize(false)}
                  className="p-2 hover:bg-dark-border rounded-lg"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Choose which categories of cookies and similar storage Fanvora may use on
              this device. Strictly-necessary cookies cannot be disabled because the
              Platform will not function without them.
            </p>

            <ConsentRow
              icon={Shield}
              title="Strictly necessary"
              description="Required to operate the Platform — for example, to keep you signed in and to remember your cookie preferences. These cannot be disabled."
              checked
              disabled
            />

            <ConsentRow
              icon={BarChart3}
              title="Analytics"
              description="Helps us understand which features are used most so we can improve the Platform. Aggregated and never used to identify you."
              checked={prefs.analytics}
              onChange={(v) => setPrefs({ ...prefs, analytics: v })}
            />

            <ConsentRow
              icon={Megaphone}
              title="Marketing"
              description="Lets us measure the performance of our advertising and tailor messages to your interests on third-party sites."
              checked={prefs.marketing}
              onChange={(v) => setPrefs({ ...prefs, marketing: v })}
            />

            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-dark-border">
              <button onClick={savePrefs} className="btn-primary flex-1 min-w-[140px]">
                Save preferences
              </button>
              <button onClick={acceptAll} className="btn-secondary flex-1 min-w-[140px]">
                Accept all
              </button>
              <button onClick={rejectNonEssential} className="btn-secondary flex-1 min-w-[140px]">
                Reject non-essential
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6 text-center">
              You can revisit these settings at any time via the "Cookie preferences" link
              in the site footer.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function ConsentRow({ icon: Icon, title, description, checked, disabled, onChange }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-dark-border last:border-b-0">
      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary-light" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h3 className="font-semibold text-white">{title}</h3>
          <Toggle checked={checked} disabled={disabled} onChange={onChange} />
        </div>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  )
}

function Toggle({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-dark-border'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 mt-0.5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default CookieConsent
