// Regenerates the PWA PNG icons from public/favicon.svg.
//
// `sharp` is intentionally NOT a permanent devDependency — the generated PNGs
// live in public/icons/ and are committed to the repo, so production builds
// (Netlify/Render) don't need it. Only run this when you change the logo.
//
// Usage:
//   cd frontend
//   npm i -D sharp        # one-time, locally
//   npm run gen:icons
//   npm uninstall sharp   # optional cleanup
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgPath = resolve(root, 'public/favicon.svg')
const outDir = resolve(root, 'public/icons')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('This script requires sharp. Install it with: npm i -D sharp')
  process.exit(1)
}

const svg = await readFile(svgPath)
await mkdir(outDir, { recursive: true })

for (const size of sizes) {
  const out = resolve(outDir, `icon-${size}x${size}.png`)
  await sharp(svg).resize(size, size).png().toFile(out)
  console.log(`wrote ${out}`)
}
