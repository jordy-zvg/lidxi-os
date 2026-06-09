'use client';

import { motion } from 'framer-motion';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface HeroProps {
  eyebrow?: string;
  headline: string;
  subheadline: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  visual?: ReactNode;
}

export function Hero({
  eyebrow,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  visual,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#F6F9FC] pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Subtle grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#7C71FF 1px, transparent 1px), linear-gradient(to right, #7C71FF 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#7C71FF]"
            >
              {eyebrow}
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
            className="text-4xl font-semibold tracking-tight text-[#0A2540] sm:text-5xl lg:text-6xl"
            style={{ letterSpacing: '-0.03em' }}
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.12 }}
            className="mt-6 text-lg leading-relaxed text-[#0A2540]/60 sm:text-xl"
          >
            {subheadline}
          </motion.p>

          {(primaryCta || secondaryCta) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.2 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              {primaryCta && (
                <Link
                  href={primaryCta.href as Route}
                  className="rounded-lg bg-[#7C71FF] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#5E52F5] active:scale-[0.98]"
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href as Route}
                  className="rounded-lg border border-ink/20 bg-white px-6 py-3 text-sm font-semibold text-[#0A2540] transition-all hover:border-ink/40 hover:bg-white active:scale-[0.98]"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </motion.div>
          )}
        </div>

        {visual && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.3 }}
            className="mt-16 overflow-hidden rounded-2xl border border-ink/10 shadow-2xl shadow-[#7C71FF]/10"
          >
            {visual}
          </motion.div>
        )}
      </div>
    </section>
  );
}
