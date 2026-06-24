import type { CSSProperties } from 'react'

const markColors = {
  accent: '#47a8ff',
  background: '#000000',
  border: '#ffffff24',
  foreground: '#ededed',
}

const EVEX_MARK_CELLS = [
  { color: markColors.accent, x: 43, y: 42 },
  { color: markColors.foreground, x: 76, y: 42 },
  { color: markColors.accent, x: 109, y: 42 },
  { color: markColors.foreground, x: 43, y: 76 },
  { color: markColors.accent, x: 76, y: 76 },
  { color: markColors.accent, x: 43, y: 110 },
  { color: markColors.foreground, x: 76, y: 110 },
  { color: markColors.accent, x: 109, y: 110 },
] as const

export function EvexMark({ size = 54 }: { size?: number }) {
  const scale = size / 180
  const containerStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'flex',
    position: 'relative',
    flexShrink: 0,
    borderRadius: 8,
    border: `1px solid ${markColors.border}`,
    backgroundColor: markColors.background,
  }

  return (
    <div style={containerStyle}>
      {EVEX_MARK_CELLS.map((cell) => (
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
