import { cn } from '@evex/ui/lib/utils'

// transitions-dev "number pop-in": each character re-enters with a blurred
// slide, and the last two characters stagger so the value feels alive on load.
// See packages skill 02-number-pop-in.md.
//
// The `is-animating` class is rendered into the markup (rather than toggled in
// an effect) so the very first painted frame is already the animation's start
// state — otherwise the digits flash at full opacity before the entrance plays.
// Keys embed the value, so a changed number remounts the digits and replays.
function getStagger(index: number, length: number): string | undefined {
  if (index === length - 2) {
    return '1'
  }
  if (index === length - 1) {
    return '2'
  }
  return
}

export function PopInNumber({
  value,
  className,
}: {
  value: number | string
  className?: string
}) {
  const text = String(value)

  // Build per-character keys that are unique without relying on the array index
  // (digits repeat). Embedding `text` means a new value produces new keys, so
  // React remounts every digit and the pop-in replays uniformly.
  const seen = new Map<string, number>()
  const chars = text.split('').map((char) => {
    const occurrence = seen.get(char) ?? 0
    seen.set(char, occurrence + 1)
    return { char, key: `${text}-${char}-${occurrence}` }
  })

  return (
    <span className={cn('t-digit-group is-animating', className)}>
      {chars.map((item, index) => (
        <span
          className="t-digit"
          data-stagger={getStagger(index, chars.length)}
          key={item.key}
        >
          {item.char}
        </span>
      ))}
    </span>
  )
}
