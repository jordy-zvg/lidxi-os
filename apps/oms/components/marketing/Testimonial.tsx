'use client';

import { motion } from 'framer-motion';

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  company: string;
}

export function Testimonial({ quote, name, role, company }: TestimonialProps) {
  return (
    <motion.blockquote
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto max-w-3xl text-center"
    >
      <p className="text-2xl font-medium leading-relaxed text-[#0A2540] sm:text-3xl">
        &ldquo;{quote}&rdquo;
      </p>
      <footer className="mt-6 flex items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#635BFF]/10 text-sm font-semibold text-[#635BFF]">
          {name.charAt(0)}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-[#0A2540]">{name}</p>
          <p className="text-xs text-ink/50">
            {role} · {company}
          </p>
        </div>
      </footer>
    </motion.blockquote>
  );
}
