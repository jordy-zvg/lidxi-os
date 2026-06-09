'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface FeatureItem {
  icon: ReactNode;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: FeatureItem[];
  columns?: 2 | 3;
}

export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  const colClass = columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 gap-8 ${colClass}`}>
      {features.map((feature, i) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
          className="group rounded-2xl border border-ink/8 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C71FF]/10 text-[#7C71FF]">
            {feature.icon}
          </div>
          <h3 className="mb-2 text-base font-semibold text-[#0A2540]">{feature.title}</h3>
          <p className="text-sm leading-relaxed text-ink/60">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
