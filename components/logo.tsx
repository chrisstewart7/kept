/* Kept monogram (§2): navy rectangle, white K, small blue bar on the left —
   like a paid-tab indicator. */
export function KeptMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="8" fill="#0b1220" />
      <rect x="5" y="8" width="3" height="16" rx="1.5" fill="#3b82f6" />
      <path
        d="M13 8v16h3.4v-5.2l1.7-1.9 4.4 7.1H26l-6-9.4 5.6-6.6h-3.9l-5.3 6.5V8H13Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <KeptMark />
      {!compact && (
        <span
          className="font-serif text-[22px] leading-none tracking-tight text-ink"
          style={{ letterSpacing: "-0.02em" }}
        >
          Kept
        </span>
      )}
    </span>
  );
}
