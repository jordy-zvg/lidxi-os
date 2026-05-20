'use client';

import { ContactForm } from '@/components/marketing/ContactForm';
import { IconBrandWhatsapp, IconMail, IconMapPin } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

const FADE = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' } as const,
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

const CONTACT_INFO = [
  {
    section: 'Ventas',
    items: [
      {
        icon: <IconMail size={16} />,
        label: 'ventas@kobi.mx',
        href: 'mailto:ventas@kobi.mx',
      },
      {
        icon: <IconBrandWhatsapp size={16} />,
        label: '+52 55 0000 0000',
        href: 'https://wa.me/5200000000',
      },
    ],
    note: 'Lun-Vie 9am-7pm CDMX',
  },
  {
    section: 'Soporte (clientes)',
    items: [
      {
        icon: <IconMail size={16} />,
        label: 'soporte@kobi.mx',
        href: 'mailto:soporte@kobi.mx',
      },
    ],
    note: '24/7 para planes Crecimiento y Escala',
  },
  {
    section: 'Prensa',
    items: [
      {
        icon: <IconMail size={16} />,
        label: 'prensa@kobi.mx',
        href: 'mailto:prensa@kobi.mx',
      },
    ],
    note: undefined,
  },
  {
    section: 'Oficina',
    items: [
      { icon: <IconMapPin size={16} />, label: 'Roma Norte, Ciudad de México', href: undefined },
    ],
    note: undefined,
  },
];

export default function ContactoPage() {
  return (
    <>
      {/* Hero compacto */}
      <section className="bg-[#F6F9FC] pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.p
            {...FADE}
            className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#635BFF]"
          >
            Contacto
          </motion.p>
          <motion.h1
            {...FADE}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.07 }}
            className="max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight text-[#0A2540] sm:text-5xl"
            style={{ letterSpacing: '-0.03em' }}
          >
            Hablemos de tu operación.
          </motion.h1>
          <motion.p
            {...FADE}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.14 }}
            className="mt-4 max-w-md text-lg leading-relaxed text-[#0A2540]/60"
          >
            Demos personalizadas, soporte, prensa o cualquier duda. Te respondemos en menos de 24
            horas hábiles.
          </motion.p>
        </div>
      </section>

      {/* Split layout */}
      <section className="bg-[#F6F9FC] pb-24 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_3fr]">
            {/* Info panel */}
            <motion.div {...FADE} className="space-y-8">
              {CONTACT_INFO.map((section) => (
                <div key={section.section}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink/40">
                    {section.section}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2.5 text-sm text-[#0A2540]"
                      >
                        <span className="text-[#635BFF]">{item.icon}</span>
                        {item.href ? (
                          <a href={item.href} className="hover:text-[#635BFF] transition-colors">
                            {item.label}
                          </a>
                        ) : (
                          <span>{item.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {section.note && <p className="mt-1.5 text-xs text-ink/40">{section.note}</p>}
                </div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div
              {...FADE}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1 }}
              className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm"
            >
              <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-ink/5" />}>
                <ContactForm />
              </Suspense>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
