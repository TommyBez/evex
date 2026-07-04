import {
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from 'remotion'

export interface PayoffLineProps {
  after?: string
  baseColor?: string
  before: string
  fontSize?: number
  fontWeight?: number
  highlight: string
  highlightColor?: string
}

interface PayoffWord {
  emphasized: boolean
  text: string
}

const toWords = (text: string, emphasized: boolean): PayoffWord[] =>
  text
    .split(' ')
    .filter(Boolean)
    .map((word) => ({ text: word, emphasized }))

const WORD_STAGGER = 3
const WORD_DURATION = 16
const HIGHLIGHT_START = 42
const HIGHLIGHT_END = 68

/**
 * One benefit sentence entering word by word, with the key phrase shifting to
 * the accent color once the line has settled. Authored per the
 * feature-announcement archetype (payoff beat).
 */
export const PayoffLine = ({
  before,
  highlight,
  after = '',
  baseColor = '#fafafa',
  highlightColor = '#0ea5e9',
  fontSize = 46,
  fontWeight = 600,
}: PayoffLineProps) => {
  const frame = useCurrentFrame()
  const easing = Easing.bezier(0.22, 1, 0.36, 1)

  const words = [
    ...toWords(before, false),
    ...toWords(highlight, true),
    ...toWords(after, false),
  ]

  const accentProgress = interpolate(
    frame,
    [HIGHLIGHT_START, HIGHLIGHT_END],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing },
  )
  const accentColor = interpolateColors(
    accentProgress,
    [0, 1],
    [baseColor, highlightColor],
  )

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        position: 'absolute',
      }}
    >
      <div
        style={{
          color: baseColor,
          display: 'flex',
          flexWrap: 'wrap',
          fontFamily:
            'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize,
          fontWeight,
          gap: '0 0.28em',
          justifyContent: 'center',
          letterSpacing: '-0.02em',
          maxWidth: 1040,
          textAlign: 'center',
        }}
      >
        {words.map((word, index) => {
          const local = frame - index * WORD_STAGGER
          const opacity = interpolate(local, [0, WORD_DURATION], [0, 1], {
            easing,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const y = interpolate(local, [0, WORD_DURATION], [14, 0], {
            easing,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <span
              key={`${word.text}-${
                // biome-ignore lint/suspicious/noArrayIndexKey: static word list, order never changes
                index
              }`}
              style={{
                color: word.emphasized ? accentColor : baseColor,
                display: 'inline-block',
                opacity,
                transform: `translateY(${y}px)`,
              }}
            >
              {word.text}
            </span>
          )
        })}
      </div>
    </div>
  )
}
