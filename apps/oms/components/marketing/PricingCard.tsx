'use client';

import { motion } from 'framer-motion';
import type { Route } from 'next';
import Link from 'next/link';

export interface PricingPlan {
  name: string;
  price: string | null;
  priceSub?: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
  badge?: string;
}

interface PricingCardProps {
  plan: PricingPlan;
  index?: number;
}

export function PricingCard({ plan, index = 0 }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.1 }}
      className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        plan.highlighted
          ? 'border-[#7C71FF] bg-[#7C71FF] text-white'
          : 'border-ink/10 bg-white text-[#0A2540]'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0A2540] px-3 py-1 text-xs font-semibold text-white">
          {plan.badge}
        </span>
      )}

      <div className="mb-6">
        <h3
          className={`text-xs font-semibold uppercase tracking-widest ${plan.highlighted ? 'text-white/70' : 'text-ink/50'}`}
        >
          {plan.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-1">
          {plan.price ? (
            <>
              <span className="text-4xl font-semibold">{plan.price}</span>
              {plan.priceSub && (
                <span className={`text-sm ${plan.highlighted ? 'text-white/60' : 'text-ink/50'}`}>
                  {plan.priceSub}
                </span>
              )}
            </>
          ) : (
            <span className="text-2xl font-semibold">Cotización</span>
          )}
        </div>
        <p className={`mt-2 text-sm ${plan.highlighted ? 'text-white/70' : 'text-ink/60'}`}>
          {plan.description}
        </p>
      </div>

      <ul className="mb-8 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-0.5 text-base leading-none ${plan.highlighted ? 'text-white' : 'text-[#7C71FF]'}`}
            >
              ✓
            </span>
            <span className={plan.highlighted ? 'text-white/80' : 'text-ink/70'}>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.cta.href as Route}
        className={`block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all active:scale-[0.98] ${
          plan.highlighted
            ? 'bg-white text-[#7C71FF] hover:bg-white/90'
            : 'bg-[#7C71FF] text-white hover:bg-[#5E52F5]'
        }`}
      >
        {plan.cta.label}
      </Link>
    </motion.div>
  );
}
