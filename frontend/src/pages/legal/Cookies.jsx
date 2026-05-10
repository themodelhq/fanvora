import { LegalLayout } from './LegalLayout'
import { openCookiePreferences } from '../../lib/consent'

const Cookies = () => (
  <LegalLayout title="Cookie Policy" lastUpdated="10 May 2026">
    <p>
      This Cookie Policy describes how <strong>Fanvora</strong> uses cookies and similar
      storage technologies on our website and mobile-installable Progressive Web App. It
      should be read together with our <a href="/legal/privacy">Privacy Policy</a>.
    </p>

    <h2>1. What is a cookie?</h2>
    <p>
      A cookie is a small text file that a website places on your device when you visit
      it. Cookies allow a site to remember your actions and preferences (such as login,
      language, or display preferences) over a period of time, so you don't have to
      re-enter them on every visit. We also use closely-related technologies such as
      <code> localStorage</code>, <code>sessionStorage</code>, and pixel tags. In this
      Policy we refer to all of them collectively as "cookies".
    </p>

    <h2>2. The categories of cookies we use</h2>
    <p>
      Cookies on Fanvora are grouped into the categories below. Only the
      <strong> Strictly necessary</strong> category is loaded automatically; everything
      else loads only after you give consent through our cookie banner.
    </p>

    <h3>Strictly necessary (always on)</h3>
    <p>
      These cookies are essential to operate the Platform &mdash; for example, to keep you
      logged in, to remember items in your cart while you check out, to remember which
      cookie categories you have accepted, and to balance load between our servers. The
      Platform will not function correctly without them, so you cannot disable them.
    </p>
    <ul>
      <li><strong>fanvora-auth</strong> &mdash; stores your authentication token (set after sign-in). Persistent. First-party.</li>
      <li><strong>fanvora-cookie-consent</strong> &mdash; stores your cookie-preference choices and the version of this Policy you accepted. Persistent (12 months). First-party.</li>
    </ul>

    <h3>Analytics (optional, requires consent)</h3>
    <p>
      Analytics cookies help us understand which pages and features people use, where users
      are dropping off, and how to improve the product. The data is aggregated and we do
      not use it to identify individual fans or creators. We do not currently load any
      analytics scripts; if and when we add a provider (such as Plausible, Fathom, or
      Google Analytics) it will only run after you opt in.
    </p>

    <h3>Marketing (optional, requires consent)</h3>
    <p>
      Marketing cookies are used to measure the performance of our advertising and to
      personalise the messages you see on third-party sites. We do not currently use any
      marketing cookies; if and when we add a provider (such as Meta Pixel or X / Twitter
      Pixel) it will only run after you opt in.
    </p>

    <h2>3. How long cookies last</h2>
    <p>
      Cookies are either <em>session</em> cookies (deleted when you close your browser) or
      <em> persistent</em> cookies (stored for a defined period). Our authentication
      cookie expires after 30 days of inactivity. Your cookie-consent preference is stored
      for 12 months, after which we will ask again.
    </p>

    <h2>4. Managing your preferences</h2>
    <p>
      The cookie banner that appears on your first visit lets you accept all categories,
      reject all non-essential categories, or open a preference centre and toggle each
      category individually. You can change your choice at any time by opening the
      preference centre via the link below or in the site footer.
    </p>
    <p>
      <button
        type="button"
        onClick={openCookiePreferences}
        className="btn-primary text-sm"
      >
        Open cookie preferences
      </button>
    </p>
    <p>
      You can also manage cookies directly in your browser settings, including blocking
      all cookies or deleting existing ones. Doing so may affect functionality (for
      example, blocking the strictly-necessary cookie will sign you out).
    </p>

    <h2>5. Do Not Track</h2>
    <p>
      Some browsers offer a "Do Not Track" (DNT) signal. There is no industry consensus on
      how DNT should be honoured, so we currently do not respond to DNT signals; instead
      we rely on the per-category consent collected through our banner.
    </p>

    <h2>6. Changes to this Policy</h2>
    <p>
      We may update this Cookie Policy when we add, remove, or change the technologies we
      use. The "Last updated" date above reflects the latest revision. Material changes
      will trigger the cookie banner to reappear so you can review and renew your
      preferences.
    </p>

    <h2>7. Contact</h2>
    <p>
      Questions about cookies can be sent to
      <a href="mailto:privacy@fanvora.com"> privacy@fanvora.com</a>.
    </p>
  </LegalLayout>
)

export default Cookies
