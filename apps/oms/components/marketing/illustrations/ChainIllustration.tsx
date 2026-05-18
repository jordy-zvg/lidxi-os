export function ChainIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="320" height="240" rx="16" fill="#F6F9FC" />

      {/* Building 1 — center, tallest */}
      <rect
        x="120"
        y="60"
        width="80"
        height="160"
        rx="4"
        fill="white"
        stroke="#0A2540"
        strokeWidth="1.5"
        strokeOpacity="0.1"
      />
      <rect x="120" y="60" width="80" height="16" rx="4" fill="#635BFF" opacity="0.15" />
      {/* Windows B1 */}
      {[80, 100, 120, 140, 160].map((y) => (
        <g key={y}>
          <rect
            x="130"
            y={y}
            width="20"
            height="14"
            rx="2"
            fill="#F6F9FC"
            stroke="#0A2540"
            strokeWidth="0.8"
            strokeOpacity="0.12"
          />
          <rect
            x="158"
            y={y}
            width="20"
            height="14"
            rx="2"
            fill="#F6F9FC"
            stroke="#0A2540"
            strokeWidth="0.8"
            strokeOpacity="0.12"
          />
        </g>
      ))}

      {/* Building 2 — left, medium */}
      <rect
        x="30"
        y="100"
        width="70"
        height="120"
        rx="4"
        fill="white"
        stroke="#0A2540"
        strokeWidth="1.5"
        strokeOpacity="0.1"
      />
      <rect x="30" y="100" width="70" height="14" rx="4" fill="#635BFF" opacity="0.1" />
      {/* Windows B2 */}
      {[120, 140, 160].map((y) => (
        <g key={y}>
          <rect
            x="40"
            y={y}
            width="18"
            height="12"
            rx="2"
            fill="#F6F9FC"
            stroke="#0A2540"
            strokeWidth="0.8"
            strokeOpacity="0.12"
          />
          <rect
            x="64"
            y={y}
            width="18"
            height="12"
            rx="2"
            fill="#F6F9FC"
            stroke="#0A2540"
            strokeWidth="0.8"
            strokeOpacity="0.12"
          />
        </g>
      ))}

      {/* Building 3 — right, medium */}
      <rect
        x="220"
        y="110"
        width="70"
        height="110"
        rx="4"
        fill="white"
        stroke="#0A2540"
        strokeWidth="1.5"
        strokeOpacity="0.1"
      />
      <rect x="220" y="110" width="70" height="14" rx="4" fill="#635BFF" opacity="0.1" />
      {/* Windows B3 */}
      {[130, 150, 170].map((y) => (
        <g key={y}>
          <rect
            x="230"
            y={y}
            width="18"
            height="12"
            rx="2"
            fill="#F6F9FC"
            stroke="#0A2540"
            strokeWidth="0.8"
            strokeOpacity="0.12"
          />
          <rect
            x="254"
            y={y}
            width="18"
            height="12"
            rx="2"
            fill="#F6F9FC"
            stroke="#0A2540"
            strokeWidth="0.8"
            strokeOpacity="0.12"
          />
        </g>
      ))}

      {/* Connection lines between buildings */}
      <path
        d="M100 140 Q160 120 120 140"
        stroke="#635BFF"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        strokeDasharray="4 3"
      />
      <path
        d="M200 140 Q220 130 220 140"
        stroke="#635BFF"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        strokeDasharray="4 3"
      />

      {/* Central node */}
      <circle cx="160" cy="40" r="14" fill="#635BFF" opacity="0.12" />
      <circle cx="160" cy="40" r="8" fill="#635BFF" opacity="0.2" />
      <circle cx="160" cy="40" r="4" fill="#635BFF" />

      {/* Lines from node to buildings */}
      <line
        x1="160"
        y1="54"
        x2="160"
        y2="62"
        stroke="#635BFF"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />
      <line
        x1="152"
        y1="48"
        x2="65"
        y2="100"
        stroke="#635BFF"
        strokeWidth="1.5"
        strokeOpacity="0.2"
      />
      <line
        x1="168"
        y1="48"
        x2="255"
        y2="110"
        stroke="#635BFF"
        strokeWidth="1.5"
        strokeOpacity="0.2"
      />

      {/* Ground */}
      <rect x="20" y="218" width="280" height="4" rx="2" fill="#0A2540" opacity="0.06" />
    </svg>
  );
}
