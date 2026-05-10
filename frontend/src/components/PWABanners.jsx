import { useState } from 'react'
import { Download, WifiOff, RefreshCw, X } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

export function OfflineBanner() {
  const { isOnline } = usePWA()
  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
      <WifiOff size={16} />
      <span>You're offline. Some features may be unavailable.</span>
    </div>
  )
}

export function InstallBanner() {
  const { canInstall, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-gradient-to-r from-violet-900 to-purple-900 border border-violet-500/30 rounded-2xl p-4 shadow-2xl shadow-violet-900/50 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Download size={20} className="text-violet-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Install Fanvora App</p>
            <p className="text-violet-300 text-xs mt-0.5">
              Add to your home screen for the best experience — offline access & fast loading.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={promptInstall}
                className="flex-1 bg-violet-500 hover:bg-violet-400 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-violet-400 hover:text-violet-300 text-xs py-2 px-3 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-violet-400 hover:text-violet-300 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function UpdateBanner() {
  const { updateAvailable, applyUpdate } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (!updateAvailable || dismissed) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <RefreshCw size={20} className="text-blue-300 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">Update Available</p>
            <p className="text-blue-300 text-xs mt-0.5">A new version of Fanvora is ready.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyUpdate}
              className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
            >
              Update
            </button>
            <button onClick={() => setDismissed(true)}>
              <X size={16} className="text-blue-400 hover:text-blue-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
