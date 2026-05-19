import { IconBarrierBlock } from '@tabler/icons-react';

interface SoonPlaceholderProps {
  title: string;
  description: string;
}

export function SoonPlaceholder({ title, description }: SoonPlaceholderProps) {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#635BFF]/10 text-[#635BFF]">
        <IconBarrierBlock size={28} />
      </div>
      <h1 className="text-2xl font-semibold text-[#0A2540]">{title}</h1>
      <p className="mt-2 text-sm text-ink/60">{description}</p>
      <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-ink/50">
        Próximamente
      </p>
    </div>
  );
}
