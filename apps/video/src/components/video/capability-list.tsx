import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { geistSansStack } from '@/fonts'

export interface CapabilityListProps {
  accent?: string
  fontSize?: number
  items: string[]
  /** Frames between each item's entrance. */
  stagger?: number
  textColor?: string
}

const ITEM_DURATION = 16

/**
 * A checklist that "checks off" one row at a time: each capability slides up as
 * its accent check pops in. Reads as the agent completing concrete tasks rather
 * than a static feature list.
 */
export const CapabilityList = ({
  items,
  accent = '#0ea5e9',
  textColor = '#fafafa',
  fontSize = 36,
  stagger = 24,
}: CapabilityListProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const badge = Math.round(fontSize * 1.05)

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
          display: 'flex',
          flexDirection: 'column',
          gap: fontSize * 0.62,
        }}
      >
        {items.map((item, index) => {
          const local = frame - index * stagger
          const enter = interpolate(local, [0, ITEM_DURATION], [0, 1], {
            easing: Easing.bezier(0.22, 1, 0.36, 1),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const check = spring({
            config: { damping: 12, mass: 0.6, stiffness: 200 },
            fps,
            frame: local - 3,
          })
          return (
            <div
              key={item}
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: fontSize * 0.5,
                opacity: enter,
                transform: `translateY(${(1 - enter) * 18}px)`,
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: accent,
                  borderRadius: badge,
                  display: 'flex',
                  height: badge,
                  justifyContent: 'center',
                  transform: `scale(${check})`,
                  width: badge,
                }}
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height={badge * 0.56}
                  viewBox="0 0 24 24"
                  width={badge * 0.56}
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="#050505"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                  />
                </svg>
              </div>
              <span
                style={{
                  color: textColor,
                  fontFamily: geistSansStack,
                  fontSize,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                }}
              >
                {item}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
