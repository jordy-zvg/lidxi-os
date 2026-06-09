'use client';

import { CTASection } from '@/components/marketing';
import {
  ChainIllustration,
  KitchenIllustration,
  RestaurantIllustration,
} from '@/components/marketing/illustrations';
import { motion } from 'framer-motion';

const FADE = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' } as const,
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

const PROFILES = [
  {
    id: 'dark-kitchens',
    eyebrow: 'Dark Kitchens',
    headline: 'Operación 100% delivery, multi-marca, alta velocidad.',
    subheadline:
      'Tus márgenes dependen de quitar cada segundo de fricción y cada punto de comisión innecesaria.',
    body: [
      'Las dark kitchens viven en el límite operativo del delivery: una sola cocina física que atiende 3, 5 o 10 marcas virtuales, cada una con su propio menú, su propio precio por canal, sus propios tiempos. La fricción invisible se acumula: un pedido mal copiado, un platillo agotado que llegó a un canal pero no a otro, una hora pico donde los marketplaces cobran 30% y la entrega además se atrasa.',
      'Kobi se construyó observando estas cocinas. Cada marca virtual es un tenant lógico dentro de la misma operación. El mismo cocinero ve los pedidos de las 5 marcas en un solo KDS con el filtro correcto. Las reglas de automatización paran un menú específico cuando el stock baja. El storefront propio le devuelve 20 puntos de margen al pedido directo.',
    ],
    bullets: [
      'Multi-marca en una sola cocina con menús distintos por canal',
      'Reglas automáticas de pausar/reanudar menús por inventario',
      'Storefront propio con Uber Direct para pedidos sin comisión',
      'KDS filtrado por estación y marca',
    ],
    stat: {
      value: '28%',
      label: 'Ahorro promedio en comisiones cuando el storefront propio representa 30% del volumen',
    },
    Illustration: KitchenIllustration,
    flip: false,
  },
  {
    id: 'restaurantes',
    eyebrow: 'Restaurantes con Delivery',
    headline: 'Sala + delivery, sin que uno le quite tiempo al otro.',
    subheadline:
      'El delivery no debería ser un caos paralelo. Debería ser otro canal más, manejado con el mismo cuidado que la mesa.',
    body: [
      'Un restaurante con sala que también hace delivery tiene un problema doble: la sala demanda atención inmediata y los marketplaces no esperan. En la mayoría de los casos, el delivery termina siendo manejado por alguien que también lleva mesas, copia pedidos a mano del tablet de Uber Eats y le grita al cocinero. Es ineficiente, pierde pedidos y desgasta al equipo.',
      'Con Kobi, los pedidos de delivery entran directamente al KDS de cocina sin tocar al personal de sala. El POS de mesa y el OMS de delivery son el mismo sistema con vistas distintas. El cocinero ve toda la cola en un solo lugar y decide prioridad real. Los reportes muestran qué canal da más margen y qué horas pico requieren refuerzo.',
    ],
    bullets: [
      'POS de mesa con cuentas separadas, propinas, división',
      'OMS de delivery integrado sin desviar al personal de sala',
      'KDS único con priorización inteligente',
      'Reportes que comparan margen real por canal',
    ],
    stat: {
      value: '2.5x',
      label:
        'Aumento promedio en pedidos por hora durante rush cuando la operación deja de copiar pedidos a mano',
    },
    Illustration: RestaurantIllustration,
    flip: true,
  },
  {
    id: 'cadenas',
    eyebrow: 'Cadenas',
    headline: 'Múltiples sucursales, una sola vista, control sin fricción.',
    subheadline:
      'Operar 3, 10 o 50 sucursales sin perder el detalle ni el control central. Los reportes consolidados no son suficientes: necesitas configurar como uno y reportar como muchos.',
    body: [
      'Una cadena pierde dinero en lo que no ve. Un menú actualizado en una sucursal pero no en otra. Un precio que cambió y no se propagó. Una promoción que se activó por error. Un cierre de caja que llega inconsistente porque cada gerente registra distinto. La consolidación manual al final del mes es donde se pierde el margen.',
      'Kobi permite configurar al nivel correcto: el menú base es de la marca, pero cada sucursal puede tener variantes locales. Los precios y promociones se propagan automáticamente. Los reportes ruedan al CEO con la granularidad que necesita, no la que sobra. Y una nueva sucursal se monta en 15 minutos clonando la configuración madre.',
    ],
    bullets: [
      'Configuración madre-sucursal con herencia automática',
      'Reportes consolidados con drill-down por sucursal',
      'Permisos granulares por rol y sucursal',
      'Setup de nueva sucursal en menos de 15 minutos',
    ],
    stat: {
      value: '15 min',
      label:
        'Tiempo promedio para activar una nueva sucursal desde cero con menú, precios y configuración heredados',
    },
    Illustration: ChainIllustration,
    flip: false,
  },
];

export default function ParaQuienPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#F6F9FC] pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.p
              {...FADE}
              className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#7C71FF]"
            >
              Perfiles
            </motion.p>
            <motion.h1
              {...FADE}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.07 }}
              className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#0A2540] sm:text-5xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Construido para restaurantes que operan de verdad.
            </motion.h1>
            <motion.p
              {...FADE}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.14 }}
              className="mt-6 text-lg leading-relaxed text-[#0A2540]/60"
            >
              Cocinas oscuras, marcas virtuales, cadenas con varias sucursales, restaurantes
              tradicionales que quieren modernizarse. Cada uno tiene un problema operativo distinto.
              Kobi se adapta sin volverse genérico.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Profile sections */}
      {PROFILES.map((profile, i) => (
        <section
          key={profile.id}
          id={profile.id}
          className={`py-20 sm:py-28 ${i % 2 === 0 ? 'bg-white' : 'bg-[#F6F9FC]'}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={`grid grid-cols-1 items-start gap-16 lg:grid-cols-2 ${profile.flip ? 'lg:grid-flow-col-dense' : ''}`}
            >
              {/* Illustration */}
              <motion.div
                {...FADE}
                transition={{
                  duration: 0.6,
                  ease: [0.21, 0.47, 0.32, 0.98],
                  delay: profile.flip ? 0 : 0.1,
                }}
                className={profile.flip ? 'lg:col-start-2' : ''}
              >
                <profile.Illustration className="w-full rounded-2xl shadow-sm" />

                {/* Stat */}
                <div className="mt-6 rounded-2xl border border-[#7C71FF]/15 bg-[#7C71FF]/5 p-6">
                  <p className="text-4xl font-semibold text-[#7C71FF]">{profile.stat.value}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{profile.stat.label}</p>
                </div>
              </motion.div>

              {/* Text */}
              <motion.div
                {...FADE}
                transition={{
                  duration: 0.6,
                  ease: [0.21, 0.47, 0.32, 0.98],
                  delay: profile.flip ? 0.1 : 0,
                }}
                className={profile.flip ? 'lg:col-start-1' : ''}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#7C71FF]">
                  {profile.eyebrow}
                </p>
                <h2
                  className="mb-4 text-3xl font-semibold leading-[1.2] tracking-tight text-[#0A2540] sm:text-[40px]"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {profile.headline}
                </h2>
                <p className="mb-6 text-lg leading-relaxed text-ink/60">{profile.subheadline}</p>
                {profile.body.map((para) => (
                  <p key={para.slice(0, 20)} className="mb-4 text-sm leading-relaxed text-ink/70">
                    {para}
                  </p>
                ))}
                <ul className="mt-6 space-y-2.5">
                  {profile.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-ink/70">
                      <span className="mt-0.5 shrink-0 text-[#7C71FF]">→</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      <CTASection
        headline="¿No estás seguro qué perfil eres?"
        subheadline="Agenda una demo de 20 minutos. Te ayudamos a entender si Kobi encaja con tu operación."
        primaryCta={{ label: 'Agendar demo', href: '/contacto' }}
        secondaryCta={{ label: 'Ver características', href: '/caracteristicas' }}
      />
    </>
  );
}
