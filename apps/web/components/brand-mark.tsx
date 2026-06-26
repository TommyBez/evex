import { cn } from '@evex/ui/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground',
        className,
      )}
    >
      <svg
        aria-hidden="true"
        className="size-full"
        fill="none"
        focusable="false"
        viewBox="32 31 116 118"
      >
        <rect fill="var(--brand)" height="28" rx="4" width="28" x="43" y="42" />
        <rect fill="currentColor" height="28" rx="4" width="28" x="76" y="42" />
        <rect
          fill="var(--brand)"
          height="28"
          rx="4"
          width="28"
          x="109"
          y="42"
        />
        <rect fill="currentColor" height="28" rx="4" width="28" x="43" y="76" />
        <rect fill="var(--brand)" height="28" rx="4" width="28" x="76" y="76" />
        <rect
          fill="var(--brand)"
          height="28"
          rx="4"
          width="28"
          x="43"
          y="110"
        />
        <rect
          fill="currentColor"
          height="28"
          rx="4"
          width="28"
          x="76"
          y="110"
        />
        <rect
          fill="var(--brand)"
          height="28"
          rx="4"
          width="28"
          x="109"
          y="110"
        />
      </svg>
    </span>
  )
}
