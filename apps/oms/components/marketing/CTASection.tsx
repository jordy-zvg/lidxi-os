'use client';

import { motion } from 'framer-motion';
import type { Route } from 'next';
import Link from 'next/link';

interface CTASectionProps {
  headline: string;
  subheadline?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function CTASection({ headline, subheadline, primaryCta, secondaryCta }: CTASectionProps) {
  return (
    <section className="bg-[#0A2540]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {headline}
          </h2>
          {subheadline && <p className="mt-4 text-lg text-white/60">{subheadline}</p>}
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {primaryCta && (
                <Link
                  href={primaryCta.href as Route}
                  className="rounded-lg bg-[#635BFF] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#4f48d9] active:scale-[0.98]"
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href as Route}
                  className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white/40 active:scale-[0.98]"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
