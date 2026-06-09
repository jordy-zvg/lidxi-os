export function KitchenIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="320" height="240" rx="16" fill="#F6F9FC" />

      {/* Counter */}
      <rect x="20" y="160" width="280" height="60" rx="8" fill="#0A2540" opacity="0.06" />
      <rect x="20" y="155" width="280" height="10" rx="4" fill="#0A2540" opacity="0.12" />

      {/* KDS screen 1 */}
      <rect x="30" y="70" width="80" height="80" rx="8" fill="#0A2540" />
      <rect x="36" y="78" width="68" height="12" rx="3" fill="#7C71FF" opacity="0.4" />
      <rect x="36" y="96" width="68" height="8" rx="2" fill="white" opacity="0.2" />
      <rect x="36" y="108" width="50" height="8" rx="2" fill="white" opacity="0.2" />
      <rect x="36" y="120" width="60" height="8" rx="2" fill="#22c55e" opacity="0.5" />
      <rect x="36" y="132" width="40" height="8" rx="2" fill="#f59e0b" opacity="0.5" />

      {/* KDS screen 2 */}
      <rect x="120" y="70" width="80" height="80" rx="8" fill="#0A2540" />
      <rect x="126" y="78" width="68" height="12" rx="3" fill="#7C71FF" opacity="0.4" />
      <rect x="126" y="96" width="68" height="8" rx="2" fill="white" opacity="0.2" />
      <rect x="126" y="108" width="45" height="8" rx="2" fill="white" opacity="0.2" />
      <rect x="126" y="120" width="55" height="8" rx="2" fill="#22c55e" opacity="0.5" />

      {/* KDS screen 3 */}
      <rect x="210" y="70" width="80" height="80" rx="8" fill="#0A2540" />
      <rect x="216" y="78" width="68" height="12" rx="3" fill="#f59e0b" opacity="0.4" />
      <rect x="216" y="96" width="68" height="8" rx="2" fill="white" opacity="0.2" />
      <rect x="216" y="108" width="55" height="8" rx="2" fill="white" opacity="0.2" />
      <rect x="216" y="120" width="35" height="8" rx="2" fill="white" opacity="0.15" />

      {/* Ticket printer */}
      <rect x="120" y="30" width="80" height="35" rx="6" fill="#7C71FF" opacity="0.15" />
      <rect x="130" y="38" width="60" height="4" rx="2" fill="#7C71FF" opacity="0.4" />
      <rect x="135" y="46" width="50" height="4" rx="2" fill="#7C71FF" opacity="0.3" />
      <rect x="148" y="58" width="24" height="14" rx="2" fill="white" opacity="0.5" />

      {/* Multi-brand labels */}
      <rect x="30" y="56" width="30" height="10" rx="3" fill="#7C71FF" />
      <rect x="66" y="56" width="30" height="10" rx="3" fill="#f59e0b" />
      <rect x="120" y="56" width="30" height="10" rx="3" fill="#ef4444" opacity="0.7" />
      <rect x="156" y="56" width="30" height="10" rx="3" fill="#22c55e" />
      <rect x="210" y="56" width="30" height="10" rx="3" fill="#0ea5e9" />

      {/* Sparkle dot highlights */}
      <circle cx="100" cy="36" r="4" fill="#7C71FF" opacity="0.3" />
      <circle cx="220" cy="36" r="3" fill="#7C71FF" opacity="0.2" />
    </svg>
  );
}
