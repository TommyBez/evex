import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { ImageResponse } from 'next/og'

export const ogImageSize = {
  width: 1200,
  height: 630,
} as const

export const ogImageContentType = 'image/png'

const PIXEL_FONT_FAMILY = 'Geist Pixel Square'

// Geist Pixel ships only as a woff2 with next/font, but Satori (next/og) can't
// parse woff2 — so a TTF conversion is vendored alongside this module. It's
// referenced via import.meta.url so the bundler emits it, then read from disk
// (these routes run on the Node runtime, where fetch() can't load file: URLs).
// Read once and reuse per process.
let pixelFontData: Promise<Buffer> | null = null
function loadPixelFont(): Promise<Buffer> {
  if (!pixelFontData) {
    pixelFontData = readFile(
      fileURLToPath(new URL('./fonts/geist-pixel-square.ttf', import.meta.url)),
    )
  }
  return pixelFontData
}

const colors = {
  background: '#000000',
  card: '#0a0a0a',
  panel: '#171717',
  foreground: '#ededed',
  muted: '#a3a3a3',
  border: '#ffffff24',
  accent: '#47a8ff',
}

interface OgImageProps {
  author?: string
  description?: string
  eyebrow: string
  install?: string
  title: string
}

function EvexMark({ size = 54 }: { size?: number }) {
  const scale = size / 180
  const cells = [
    { color: colors.accent, x: 43, y: 42 },
    { color: colors.foreground, x: 76, y: 42 },
    { color: colors.accent, x: 109, y: 42 },
    { color: colors.foreground, x: 43, y: 76 },
    { color: colors.accent, x: 76, y: 76 },
    { color: colors.accent, x: 43, y: 110 },
    { color: colors.foreground, x: 76, y: 110 },
    { color: colors.accent, x: 109, y: 110 },
  ]

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        position: 'relative',
        flexShrink: 0,
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.background,
      }}
    >
      {cells.map((cell) => (
        <div
          key={`${cell.x}-${cell.y}`}
          style={{
            position: 'absolute',
            left: cell.x * scale,
            top: cell.y * scale,
            width: 28 * scale,
            height: 28 * scale,
            borderRadius: 4 * scale,
            backgroundColor: cell.color,
          }}
        />
      ))}
    </div>
  )
}

const WHITESPACE_SPLIT = /\s+/

function getTitleSize(length: number): number {
  if (length > 70) {
    return 54
  }
  if (length > 44) {
    return 66
  }
  return 78
}

const TAGLINE = 'the eve agent registry'

export function initialsFromName(name: string): string {
  const initials = name
    .split(WHITESPACE_SPLIT)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return initials || 'E'
}

export async function createOgImage(
  { eyebrow, title, description, author, install }: OgImageProps,
  options: { status?: number } = {},
) {
  const safeTitle = truncate(title, 80)
  const safeDescription = description ? truncate(description, 150) : undefined
  const titleSize = getTitleSize(safeTitle.length)
  const pixelFont = await loadPixelFont()

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        padding: 72,
        backgroundColor: colors.background,
        color: colors.foreground,
        fontFamily:
          'Geist, Arial, Helvetica, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 28,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
        }}
      />

      {/* Header: brand lockup + a single category pill. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <EvexMark size={40} />
          <div style={{ fontFamily: PIXEL_FONT_FAMILY, fontSize: 26 }}>
            evex
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: 999,
            backgroundColor: 'rgba(71, 168, 255, 0.12)',
            color: colors.accent,
            fontSize: 20,
            fontWeight: 500,
            padding: '8px 18px',
            lineHeight: 1,
          }}
        >
          {eyebrow}
        </div>
      </div>

      {/* Hero: title + the real description. */}
      <div
        style={{
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -1,
            overflowWrap: 'break-word',
          }}
        >
          {safeTitle}
        </div>
        {safeDescription ? (
          <div
            style={{
              maxWidth: 920,
              color: colors.muted,
              fontSize: 32,
              lineHeight: 1.3,
              overflowWrap: 'break-word',
            }}
          >
            {safeDescription}
          </div>
        ) : null}
      </div>

      {/* Footer: attribution on the left, install hint on the right. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        {author ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                borderRadius: 999,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.panel,
                color: colors.foreground,
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {initialsFromName(author)}
            </div>
            <div style={{ display: 'flex', fontSize: 24 }}>{author}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', color: colors.muted, fontSize: 22 }}>
            {TAGLINE}
          </div>
        )}
        {install ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              backgroundColor: colors.card,
              color: colors.foreground,
              fontFamily: PIXEL_FONT_FAMILY,
              fontSize: 22,
              padding: '14px 18px',
              lineHeight: 1,
            }}
          >
            <span style={{ color: colors.accent }}>$</span>
            {install}
          </div>
        ) : null}
      </div>
    </div>,
    {
      ...ogImageSize,
      status: options.status,
      fonts: [
        {
          name: PIXEL_FONT_FAMILY,
          data: pixelFont,
          weight: 500,
          style: 'normal',
        },
      ],
    },
  )
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value
  }
  return `${value.slice(0, maxLength - 1).trimEnd()}...`
}
