import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

// The evex brand mark: an 8-square grid (3x3 with the top-right-of-center cell
// empty) reproduced from apps/web/components/brand-mark.tsx. `brand` cells take
// the accent, the rest take the foreground color.
interface MarkCell {
  brand: boolean
  col: number
  order: number
  row: number
}

const MARK_CELLS: MarkCell[] = [
  { brand: true, col: 0, order: 0, row: 0 },
  { brand: false, col: 1, order: 1, row: 0 },
  { brand: true, col: 2, order: 2, row: 0 },
  { brand: false, col: 0, order: 3, row: 1 },
  { brand: true, col: 1, order: 4, row: 1 },
  { brand: true, col: 0, order: 5, row: 2 },
  { brand: false, col: 1, order: 6, row: 2 },
  { brand: true, col: 2, order: 7, row: 2 },
]

const CELL_STAGGER = 3

export interface LogoStingProps {
  accent?: string
  fontFamily?: string
  markColor?: string
  showWordmark?: boolean
  /** Side length of one grid square, in px. */
  unit?: number
  wordmark?: string
  wordmarkColor?: string
  /** Frame the wordmark begins building (overlaps the mark tail). */
  wordmarkStart?: number
}

/**
 * A single-mark brand sting (the `logo-sting` primitive the logo-bumper
 * archetype calls for). Frame-driven and transparent so it composes over any
 * backdrop: the mark squares pop in with a springy stagger, then the wordmark
 * builds character by character.
 */
export const LogoSting = ({
  accent = '#47a8ff',
  markColor = '#fafafa',
  wordmark = 'evex',
  wordmarkColor = '#fafafa',
  unit = 40,
  fontFamily = 'var(--font-geist-mono), ui-monospace, monospace',
  showWordmark = true,
  wordmarkStart = 22,
}: LogoStingProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const gap = Math.round(unit * 0.18)
  const radius = Math.round(unit * 0.16)
  const markSize = unit * 3 + gap * 2
  const chars = Array.from(wordmark)

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: unit * 0.7,
        inset: 0,
        justifyContent: 'center',
        position: 'absolute',
      }}
    >
      <div
        style={{
          height: markSize,
          position: 'relative',
          width: markSize,
        }}
      >
        {MARK_CELLS.map((cell) => {
          const enter = spring({
            config: { damping: 13, mass: 0.6, stiffness: 190 },
            fps,
            frame: frame - cell.order * CELL_STAGGER,
          })
          return (
            <div
              key={`${cell.row}-${cell.col}`}
              style={{
                backgroundColor: cell.brand ? accent : markColor,
                borderRadius: radius,
                height: unit,
                left: cell.col * (unit + gap),
                opacity: interpolate(enter, [0, 0.5], [0, 1], {
                  extrapolateRight: 'clamp',
                }),
                position: 'absolute',
                top: cell.row * (unit + gap),
                transform: `scale(${enter})`,
                transformOrigin: 'center',
                width: unit,
              }}
            />
          )
        })}
      </div>
      {showWordmark ? (
        <div
          style={{
            color: wordmarkColor,
            display: 'flex',
            fontFamily,
            fontSize: markSize * 0.72,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}
        >
          {chars.map((char, index) => {
            const local = frame - wordmarkStart - index * 4
            const opacity = interpolate(local, [0, 14], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
            const y = interpolate(local, [0, 14], [unit * 0.5, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
            return (
              <span
                key={`${char}-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed wordmark, order is stable
                  index
                }`}
                style={{
                  display: 'inline-block',
                  opacity,
                  transform: `translateY(${y}px)`,
                }}
              >
                {char}
              </span>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
