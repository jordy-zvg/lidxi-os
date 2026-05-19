import { KobiWordmark } from '@kobi/ui';
import Link from 'next/link';

export default function SinAccesoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F9FC] px-6 text-center">
      <div className="mb-8">
        <KobiWordmark size="md" />
      </div>
      <h1 className="text-3xl font-semibold text-[#0A2540]">Sin acceso al panel</h1>
      <p className="mt-3 max-w-md text-sm text-ink/60">
        Tu cuenta no tiene permisos de administrador para este tenant. Pide al dueño del restaurante
        que te invite con un rol válido.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/ingresar"
          className="rounded-full bg-[#635BFF] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4f48d9]"
        >
          Volver a ingresar
        </Link>
        <Link
          href="/contacto"
          className="rounded-full border border-ink/15 bg-white px-5 py-2 text-sm font-medium text-[#0A2540] hover:bg-ink/[0.02]"
        >
          Contactar soporte
        </Link>
      </div>
    </div>
  );
}
