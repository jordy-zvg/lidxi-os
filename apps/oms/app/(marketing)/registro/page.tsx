import { RegistroForm } from '@/components/auth/RegistroForm';
import { KobiWordmark } from '@kobi/ui';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Crear cuenta' };

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo — brand */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#0A2540] p-12 lg:flex">
        <KobiWordmark size="md" variant="dark" />
        <div className="space-y-6">
          <p className="text-2xl font-medium leading-snug text-white">
            Empieza a operar con Kobi
            <br />
            en menos de 10 minutos.
          </p>
          <ul className="space-y-3">
            {[
              '14 días gratis, sin tarjeta',
              'Setup en menos de 10 minutos',
              'Cancela cuando quieras',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#635BFF]/30 text-[#635BFF]">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/30">© 2026 Kobi · Ciudad de México</p>
      </div>

      {/* Panel derecho — form */}
      <div className="flex flex-1 items-center justify-center bg-[#F6F9FC] px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <KobiWordmark size="sm" variant="light" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-[#0A2540]">Crea tu cuenta</h1>
          <p className="mb-8 text-sm text-ink/50">Empieza a operar con Kobi hoy.</p>
          <RegistroForm />
        </div>
      </div>
    </div>
  );
}
