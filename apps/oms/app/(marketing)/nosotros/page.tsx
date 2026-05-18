'use client';

import { CTASection } from '@/components/marketing';
import {
  IconBolt,
  IconBrandLinkedin,
  IconBuildingStore,
  IconClock,
  IconCurrencyDollar,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

const FADE = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' } as const,
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

const PRINCIPLES = [
  {
    icon: <IconBolt size={20} />,
    headline: 'El software debe quitarte trabajo, no agregarte.',
    body: 'Cada feature de Kobi se evalúa contra una sola pregunta: ¿esto reemplaza una acción humana o la duplica? Si no reemplaza, no entra.',
  },
  {
    icon: <IconBuildingStore size={20} />,
    headline: 'La marca del restaurante es del restaurante.',
    body: 'No del marketplace que cobra 28% por mostrarla. El storefront propio no es un feature, es una postura sobre quién es dueño del cliente.',
  },
  {
    icon: <IconClock size={20} />,
    headline: 'Las decisiones de operación pasan en segundos.',
    body: 'Los reportes mensuales son útiles. Las decisiones importantes pasan en el momento. Kobi prioriza visibilidad en tiempo real sobre reportes históricos.',
  },
  {
    icon: <IconCurrencyDollar size={20} />,
    headline: 'El precio debe ser claro, sin letras chiquitas.',
    body: 'Sin costos de setup escondidos, sin comisiones por transacción, sin penalidades por cancelación. Lo que ves en la página de precios es exactamente lo que pagas.',
  },
];

// TODO: reemplazar por fotos y datos reales del equipo
const TEAM = [
  { name: 'Equipo Kobi', role: 'Fundador y CEO', initials: 'EK' },
  { name: 'Equipo Kobi', role: 'Ingeniería', initials: 'EK' },
  { name: 'Equipo Kobi', role: 'Operaciones', initials: 'EK' },
];

export default function NosotrosPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#F6F9FC] pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.p
              {...FADE}
              className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#635BFF]"
            >
              Nosotros
            </motion.p>
            <motion.h1
              {...FADE}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.07 }}
              className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#0A2540] sm:text-5xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Los restaurantes de LATAM merecen software de clase mundial.
            </motion.h1>
            <motion.p
              {...FADE}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.14 }}
              className="mt-6 text-lg leading-relaxed text-[#0A2540]/60"
            >
              Kobi nació en Ciudad de México para devolverle el control operativo y económico a los
              restauranteros.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div {...FADE}>
            <h2
              className="mb-8 text-3xl font-semibold tracking-tight text-[#0A2540]"
              style={{ letterSpacing: '-0.02em' }}
            >
              La historia.
            </h2>
            {/* TODO: validar con stakeholder y refinar tono */}
            <div className="space-y-5 text-base leading-relaxed text-ink/70">
              <p>
                Los restaurantes en LATAM operan con herramientas que no fueron diseñadas para
                ellos. Los POS heredan flujos de los años 2000. Los sistemas de delivery son
                tableros que requieren copy-paste. La automatización es prácticamente inexistente. Y
                mientras tanto, los marketplaces se llevan 25-30% del pedido y dictan las reglas.
              </p>
              <p>
                Kobi empezó después de ver cómo opera una cocina oscura por dentro. Tres pantallas
                distintas, una para cada plataforma. Un cocinero que es también el dispatcher.
                Pedidos que se pierden en transcripción. Promociones de marketplace que se activaron
                por error y costaron margen. Un cierre de caja que toma dos horas porque hay que
                cruzar manualmente lo que dice cada app con lo que pasó en cocina.
              </p>
              <p>
                Construimos Kobi como respuesta a esa fricción concreta. No como un ERP para
                restaurantes — esos ya existen y son lentos. Sino como una plataforma operativa que
                vive en la velocidad del delivery, que entiende multi-canal nativamente y que
                automatiza lo que no debería requerir atención humana.
              </p>
              <p>
                Hoy Kobi opera en piloto con una dark kitchen en Roma Norte, Ciudad de México. En
                los próximos meses abrimos a más cocinas oscuras y restaurantes con delivery en el
                área metropolitana, antes de expandir al resto del país.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Principios */}
      <section className="bg-[#F6F9FC] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...FADE} className="mb-14">
            <h2
              className="mb-4 text-3xl font-semibold tracking-tight text-[#0A2540]"
              style={{ letterSpacing: '-0.02em' }}
            >
              Lo que creemos.
            </h2>
            <p className="text-lg text-ink/60">
              Cuatro principios que dictan cada decisión de producto.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <motion.div
                key={p.headline}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98], delay: i * 0.08 }}
                className="rounded-2xl border border-ink/8 bg-white p-8 shadow-sm"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#635BFF]/10 text-[#635BFF]">
                  {p.icon}
                </div>
                <h3 className="mb-3 text-base font-semibold leading-snug text-[#0A2540]">
                  {p.headline}
                </h3>
                <p className="text-sm leading-relaxed text-ink/60">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...FADE} className="mb-12">
            <h2
              className="mb-3 text-3xl font-semibold tracking-tight text-[#0A2540]"
              style={{ letterSpacing: '-0.02em' }}
            >
              El equipo.
            </h2>
            <p className="text-lg text-ink/60">
              Producto, ingeniería y operaciones de restaurantes.
            </p>
          </motion.div>
          {/* TODO: reemplazar por fotos y datos reales del equipo */}
          <div className="flex flex-wrap gap-6">
            {TEAM.map((member, i) => (
              <motion.div
                key={`${member.role}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98], delay: i * 0.07 }}
                className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-[#F6F9FC] p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#635BFF]/10 text-sm font-semibold text-[#635BFF]">
                  {member.initials}
                </div>
                <div>
                  <p className="font-semibold text-[#0A2540]">{member.name}</p>
                  <p className="text-sm text-ink/50">{member.role}</p>
                </div>
                <a
                  href="https://linkedin.com/company/kobi-mx"
                  className="ml-2 text-ink/30 hover:text-[#635BFF] transition-colors"
                  aria-label="LinkedIn"
                >
                  <IconBrandLinkedin size={16} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clientes */}
      <section className="bg-[#F6F9FC] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...FADE}>
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-ink/35">
              Operaciones que confían en Kobi
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <span className="text-sm font-semibold text-ink/30">Miztli Pardo</span>
              <span className="text-sm text-ink/20">·</span>
              <span className="text-sm text-ink/20">Próximamente más operaciones en CDMX</span>
            </div>
            <p className="mt-6 text-sm text-ink/40">
              Si tu operación quiere probar Kobi en su etapa temprana,{' '}
              <a href="mailto:ventas@kobi.com.mx" className="text-[#635BFF] hover:underline">
                escríbenos
              </a>
              .
            </p>
          </motion.div>
        </div>
      </section>

      <CTASection
        headline="Conoce a Kobi en operación."
        subheadline="Agenda una demo y vemos juntos cómo encaja con tu cocina."
        primaryCta={{ label: 'Agendar demo', href: '/contacto' }}
        secondaryCta={{ label: 'Ver características', href: '/caracteristicas' }}
      />
    </>
  );
}
