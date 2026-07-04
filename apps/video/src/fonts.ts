import { loadFont } from '@remotion/fonts'
import { continueRender, delayRender, staticFile } from 'remotion'

// The evex web app is built on Geist (sans + mono) with the Geist Pixel Square
// wordmark. Load the real font files (shipped in the `geist` package, copied to
// public/fonts) so the videos match the product's type exactly.

export const GEIST_SANS = 'Geist'
export const GEIST_MONO = 'Geist Mono'
export const GEIST_PIXEL = 'Geist Pixel Square'

export const geistSansStack = `${GEIST_SANS}, -apple-system, BlinkMacSystemFont, sans-serif`
export const geistMonoStack = `${GEIST_MONO}, ui-monospace, SFMono-Regular, monospace`
// Mirrors the app's --font-pixel: pixel square, then mono fallback.
export const geistPixelStack = `${GEIST_PIXEL}, ${GEIST_MONO}, monospace`

const SANS_WEIGHTS: [number, string][] = [
  [400, 'Geist-Regular.woff2'],
  [500, 'Geist-Medium.woff2'],
  [600, 'Geist-SemiBold.woff2'],
  [700, 'Geist-Bold.woff2'],
]

const MONO_WEIGHTS: [number, string][] = [
  [400, 'GeistMono-Regular.woff2'],
  [500, 'GeistMono-Medium.woff2'],
  [600, 'GeistMono-SemiBold.woff2'],
]

export const loadGeistFonts = async (): Promise<void> => {
  const jobs: Promise<void>[] = []

  for (const [weight, file] of SANS_WEIGHTS) {
    jobs.push(
      loadFont({
        family: GEIST_SANS,
        url: staticFile(`fonts/${file}`),
        weight: String(weight),
      }),
    )
  }

  for (const [weight, file] of MONO_WEIGHTS) {
    jobs.push(
      loadFont({
        family: GEIST_MONO,
        url: staticFile(`fonts/${file}`),
        weight: String(weight),
      }),
    )
  }

  jobs.push(
    loadFont({
      family: GEIST_PIXEL,
      url: staticFile('fonts/GeistPixel-Square.woff2'),
      weight: '500',
    }),
  )

  await Promise.all(jobs)
}

// Block rendering until every Geist face is ready, so no frame renders in a
// fallback font.
const fontsHandle = delayRender('load-geist-fonts')
loadGeistFonts()
  .then(() => continueRender(fontsHandle))
  .catch(() => continueRender(fontsHandle))
