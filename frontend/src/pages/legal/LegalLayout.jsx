import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '../../components/Logo'

// Shared wrapper used by Terms, Privacy, and Cookie policies. Provides the
// nav, scaffold typography, and the "Last updated" header.
export function LegalLayout({ title, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-lg border-b border-dark-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-heading text-xl font-bold gradient-text">Fanvora</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 pb-6 border-b border-dark-border">
          <h1 className="font-heading text-4xl font-bold mb-3">{title}</h1>
          <p className="text-sm text-gray-400">Last updated: {lastUpdated}</p>
        </header>

        <article className="legal-prose space-y-6 text-gray-300 leading-relaxed">
          {children}
        </article>

        <footer className="mt-16 pt-8 border-t border-dark-border text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/legal/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          <span className="ml-auto">&copy; {new Date().getFullYear()} Fanvora</span>
        </footer>
      </main>
    </div>
  )
}

export default LegalLayout
