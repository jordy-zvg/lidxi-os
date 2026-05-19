import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata = { title: 'Restablecer contraseña · Kobi' };

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F9FC] px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-[#0A2540]">Restablecer contraseña</h1>
        <p className="mt-1 mb-6 text-sm text-ink/60">
          Elige una nueva contraseña para tu cuenta de Kobi.
        </p>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
