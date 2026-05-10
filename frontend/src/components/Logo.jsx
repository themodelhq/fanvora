// Inline Fanvora heart-and-spark mark. Matches /public/favicon.svg.
// Sizing comes from className (w-*/h-*); colors come from the gradient defs below.
export function Logo({ className = 'w-8 h-8', title = 'Fanvora' }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fv-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7B2D6B" />
          <stop offset="100%" stopColor="#3D0A33" />
        </linearGradient>
        <linearGradient id="fv-logo-heart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4D78A" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="115" fill="url(#fv-logo-bg)" />
      <g fill="url(#fv-logo-heart)">
        <circle cx="186" cy="200" r="86" />
        <circle cx="326" cy="200" r="86" />
        <path d="M105 232 L256 418 L407 232 Z" />
      </g>
      <path
        d="M256 232 L271 274 L313 289 L271 304 L256 346 L241 304 L199 289 L241 274 Z"
        fill="#3D0A33"
        opacity="0.92"
      />
    </svg>
  )
}

export default Logo
