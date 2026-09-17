/* PayPig mark (§2): OnlyFans-style solid blue circle with a white rounded
   pig snout — two blue nostrils, small white ears peeking above. */
export function PigMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="16" cy="16" r="16" fill="#00AFF0" />
      {/* ears */}
      <circle cx="10.5" cy="9.5" r="2.4" fill="#ffffff" />
      <circle cx="21.5" cy="9.5" r="2.4" fill="#ffffff" />
      {/* snout */}
      <rect x="8" y="11" width="16" height="10" rx="5" fill="#ffffff" />
      {/* nostrils */}
      <circle cx="12.8" cy="16" r="1.6" fill="#00AFF0" />
      <circle cx="19.2" cy="16" r="1.6" fill="#00AFF0" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <PigMark />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/banner.png"
      alt="PayPig"
      className="h-8 w-auto shrink-0"
      draggable={false}
    />
  );
}
