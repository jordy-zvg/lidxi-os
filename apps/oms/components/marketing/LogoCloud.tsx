'use client';

import { motion } from 'framer-motion';

const INTEGRATIONS = ['Uber Eats', 'Rappi', 'Didi Food', 'Uber Direct', 'Stripe', 'WhatsApp'];

export function LogoCloud() {
  return (
    <section className="border-y border-ink/8 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-ink/40"
        >
          Integraciones nativas
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {INTEGRATIONS.map((name) => (
            <span key={name} className="text-sm font-semibold text-ink/30">
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
