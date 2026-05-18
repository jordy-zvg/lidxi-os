'use client';

import { IconChevronDown } from '@tabler/icons-react';
import { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-ink/8">
      {items.map((item, i) => (
        <div key={item.question}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between py-5 text-left"
          >
            <span className="font-medium text-[#0A2540]">{item.question}</span>
            <IconChevronDown
              size={18}
              className={`flex-shrink-0 text-ink/40 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && (
            <div className="pb-5 text-sm leading-relaxed text-ink/60">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
