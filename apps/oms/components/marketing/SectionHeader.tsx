'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  centered?: boolean;
}

export function SectionHeader({
  eyebrow,
  headline,
  subheadline,
  centered = true,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={centered ? 'text-center' : ''}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#635BFF]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
        {headline}
      </h2>
      {subheadline && (
        <p
          className={`mt-4 text-lg leading-relaxed text-ink/60 ${centered ? 'mx-auto max-w-2xl' : 'max-w-xl'}`}
        >
          {subheadline}
        </p>
      )}
    </motion.div>
  );
}
