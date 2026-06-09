'use client';

import { motion } from 'framer-motion';

interface StatProps {
  value: string;
  label: string;
}

export function Stat({ value, label }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <p className="text-5xl font-semibold tracking-tight text-[#7C71FF] sm:text-6xl">{value}</p>
      <p className="mt-2 text-sm text-ink/60">{label}</p>
    </motion.div>
  );
}
