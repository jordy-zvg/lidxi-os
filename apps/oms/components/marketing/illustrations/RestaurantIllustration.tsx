export function RestaurantIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Sky background */}
      <rect width="320" height="240" rx="16" fill="#F6F9FC" />

      {/* Building facade */}
      <rect
        x="60"
        y="80"
        width="200"
        height="140"
        rx="4"
        fill="white"
        stroke="#0A2540"
        strokeWidth="1.5"
        strokeOpacity="0.1"
      />

      {/* Awning */}
      <path d="M55 95 L265 95 L250 115 L70 115 Z" fill="#635BFF" opacity="0.15" />
      <path d="M55 95 L265 95" stroke="#635BFF" strokeWidth="2" opacity="0.4" />

      {/* Sign */}
      <rect x="100" y="100" width="120" height="24" rx="4" fill="#0A2540" opacity="0.08" />

      {/* Windows */}
      <rect
        x="80"
        y="130"
        width="50"
        height="40"
        rx="4"
        fill="#F6F9FC"
        stroke="#0A2540"
        strokeWidth="1"
        strokeOpacity="0.12"
      />
      <rect
        x="140"
        y="130"
        width="50"
        height="40"
        rx="4"
        fill="#F6F9FC"
        stroke="#0A2540"
        strokeWidth="1"
        strokeOpacity="0.12"
      />
      <rect
        x="200"
        y="130"
        width="50"
        height="40"
        rx="4"
        fill="#F6F9FC"
        stroke="#0A2540"
        strokeWidth="1"
        strokeOpacity="0.12"
      />

      {/* Table inside (visible through window) */}
      <ellipse cx="105" cy="155" rx="18" ry="8" fill="#0A2540" opacity="0.06" />
      <circle cx="96" cy="150" r="5" fill="#0A2540" opacity="0.08" />
      <circle cx="114" cy="150" r="5" fill="#0A2540" opacity="0.08" />

      {/* Door */}
      <rect
        x="140"
        y="175"
        width="40"
        height="45"
        rx="4"
        fill="#635BFF"
        opacity="0.08"
        stroke="#635BFF"
        strokeWidth="1.5"
        strokeOpacity="0.2"
      />
      <circle cx="175" cy="200" r="2.5" fill="#635BFF" opacity="0.4" />

      {/* Motorcycle / delivery */}
      <circle cx="256" cy="185" r="14" fill="none" stroke="#635BFF" strokeWidth="2" />
      <circle cx="256" cy="185" r="4" fill="#635BFF" opacity="0.3" />
      <ellipse cx="240" cy="178" rx="14" ry="8" fill="#0A2540" opacity="0.08" />
      <circle cx="226" cy="185" r="10" fill="none" stroke="#635BFF" strokeWidth="2" opacity="0.6" />
      <circle cx="226" cy="185" r="3" fill="#635BFF" opacity="0.3" />

      {/* Stars / rating */}
      <circle cx="90" cy="72" r="4" fill="#f59e0b" opacity="0.6" />
      <circle cx="102" cy="72" r="4" fill="#f59e0b" opacity="0.6" />
      <circle cx="114" cy="72" r="4" fill="#f59e0b" opacity="0.6" />
      <circle cx="126" cy="72" r="4" fill="#f59e0b" opacity="0.6" />
      <circle cx="138" cy="72" r="4" fill="#f59e0b" opacity="0.3" />

      {/* Ground */}
      <rect x="20" y="218" width="280" height="4" rx="2" fill="#0A2540" opacity="0.06" />
    </svg>
  );
}
