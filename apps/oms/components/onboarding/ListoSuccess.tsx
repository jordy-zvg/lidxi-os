'use client';

import { completeOnboarding } from '@/app/(onboarding)/onboarding/actions';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ListoSuccessProps {
  tenantName: string;
  trialEndsAt: string;
  needsSalesContact: boolean;
}

export function ListoSuccess({ tenantName, trialEndsAt, needsSalesContact }: ListoSuccessProps) {
  const [pending, setPending] = useState(false);

  const trialDate = new Date(trialEndsAt).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="text-center">
      {/* Animated checkmark */}
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-[#7C71FF]/20"
          initial={{ scale: 0.6, opacity: 1 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-[#7C71FF]"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <motion.svg
            role="img"
            aria-label="Éxito"
            viewBox="0 0 24 24"
            fill="none"
            className="h-10 w-10"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
            />
          </motion.svg>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <h1 className="mb-2 text-2xl font-semibold text-[#0A2540]">Tu cuenta está lista</h1>
        <p className="mb-2 text-sm text-ink/60">
          Ya configuraste Kobi para <span className="font-medium text-[#0A2540]">{tenantName}</span>
          .
        </p>
        <p className="mb-8 text-sm text-ink/50">
          Tu prueba gratuita termina el{' '}
          <span className="font-medium text-[#0A2540]">{trialDate}</span>.
        </p>

        {needsSalesContact && (
          <div className="mb-6 rounded-lg border border-[#7C71FF]/20 bg-[#7C71FF]/5 p-4 text-sm text-[#0A2540]">
            Un especialista te contactará en 24 horas para tu plan Escala.
          </div>
        )}

        {/* Next steps */}
        <div className="mb-8 rounded-xl border border-ink/10 p-5 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink/40">
            Próximos pasos
          </p>
          <ul className="space-y-3">
            {/* Va primero porque es el único que bloquea operar: sin empleados
                nadie puede activar el POS con un PIN. */}
            <li className="flex items-center gap-3 text-sm text-ink/70">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-ink/20 text-xs">
                1
              </span>
              Da de alta a tu primer empleado en{' '}
              <span className="font-medium text-[#7C71FF]">Equipo</span> — su PIN es lo que abre el
              POS
            </li>
            <li className="flex items-center gap-3 text-sm text-ink/70">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-ink/20 text-xs">
                2
              </span>
              Configura tus impresoras en{' '}
              <span className="font-medium text-[#7C71FF]">Ajustes › Impresoras</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-ink/70">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-ink/20 text-xs">
                3
              </span>
              Conecta Uber Eats, Rappi o Didi en{' '}
              <span className="font-medium text-[#7C71FF]">Integraciones</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-ink/70">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-ink/20 text-xs">
                4
              </span>
              Crea tu primer producto en <span className="font-medium text-[#7C71FF]">Menú</span>
            </li>
          </ul>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            await completeOnboarding();
          }}
        >
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#7C71FF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5E52F5] disabled:opacity-60 active:scale-[0.98]"
          >
            {pending ? 'Entrando…' : 'Entrar a mi panel'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
