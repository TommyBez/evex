import { ImageResponse } from 'next/og'

export const ogImageSize = {
  width: 1200,
  height: 630,
} as const

export const ogImageContentType = 'image/png'

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
  description?: string
  eyebrow: string
  footer?: string
  initials?: string
  meta?: string[]
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
    return 56
  }
  if (length > 44) {
    return 66
  }
  return 76
}

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

export function createOgImage(
  { eyebrow, title, description, footer, meta = [], initials }: OgImageProps,
  options: { status?: number } = {},
) {
  const safeTitle = truncate(title, 92)
  const safeDescription = description ? truncate(description, 180) : undefined
  const titleSize = getTitleSize(safeTitle.length)

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
      <div
        style={{
          position: 'absolute',
          left: 28,
          right: 28,
          top: 144,
          height: 1,
          backgroundColor: colors.border,
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <EvexMark />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
              evex-new
            </div>
            <div
              style={{
                color: colors.muted,
                fontSize: 18,
                lineHeight: 1.2,
              }}
            >
              the eve agent registry
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            color: colors.muted,
            fontSize: 20,
            padding: '12px 16px',
            lineHeight: 1,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 7,
              backgroundColor: colors.accent,
            }}
          />
          {eyebrow}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: initials ? 'center' : 'flex-start',
          gap: 34,
        }}
      >
        {initials ? (
          <div
            style={{
              width: 128,
              height: 128,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.card,
              color: colors.foreground,
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {initials}
          </div>
        ) : null}
        <div
          style={{
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div
            style={{
              maxWidth: initials ? 820 : 980,
              fontSize: titleSize,
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: 0,
              overflowWrap: 'break-word',
            }}
          >
            {safeTitle}
          </div>
          {safeDescription ? (
            <div
              style={{
                maxWidth: 880,
                color: colors.muted,
                fontSize: 30,
                lineHeight: 1.25,
                overflowWrap: 'break-word',
              }}
            >
              {safeDescription}
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          alignSelf: footer ? 'stretch' : 'flex-start',
          gap: 20,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          backgroundColor: colors.panel,
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {meta.slice(0, 3).map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                color: colors.foreground,
                backgroundColor: colors.card,
                fontSize: 20,
                padding: '12px 16px',
                lineHeight: 1,
              }}
            >
              {truncate(item, 42)}
            </div>
          ))}
        </div>
        {footer ? (
          <div
            style={{
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: colors.muted,
              fontFamily:
                'Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 20,
              lineHeight: 1.15,
              textAlign: 'right',
            }}
          >
            <span style={{ color: colors.accent }}>$</span>
            {truncate(footer, 64)}
          </div>
        ) : null}
      </div>
    </div>,
    {
      ...ogImageSize,
      status: options.status,
    },
  )
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value
  }
  return `${value.slice(0, maxLength - 1).trimEnd()}...`
}
