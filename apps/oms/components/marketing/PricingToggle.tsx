'use client';

interface PricingToggleProps {
  annual: boolean;
  onChange: (annual: boolean) => void;
}

export function PricingToggle({ annual, onChange }: PricingToggleProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-ink/10 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
          !annual ? 'bg-[#0A2540] text-white shadow-sm' : 'text-ink/50 hover:text-ink'
        }`}
      >
        Mensual
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
          annual ? 'bg-[#0A2540] text-white shadow-sm' : 'text-ink/50 hover:text-ink'
        }`}
      >
        Anual
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${annual ? 'bg-[#7C71FF] text-white' : 'bg-[#7C71FF]/10 text-[#7C71FF]'}`}
        >
          Ahorra 20%
        </span>
      </button>
    </div>
  );
}
