'use client';

import { compressImage } from '@/lib/compress-image';
import { createPhotoImport, processMenuImport, uploadImportPhoto } from '@/lib/menu-import-actions';
import { IconPhotoScan, IconTrash, IconUpload } from '@tabler/icons-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTOS = 10;
// 2400px: dentro del límite high-res de visión (2576px) y el texto del menú
// queda legible; el JPEG resultante cabe holgado en el bodySizeLimit (5 MB).
const MENU_PHOTO_MAX_SIDE = 2400;

/**
 * Subir N fotos del menú impreso → procesar con visión → staging.
 * Las fotos se suben UNA por server action (límite de body) y en secuencia
 * (append a input.photo_keys sin lock). processMenuImport se dispara sin
 * await: la página de staging pollea el estado del import.
 */
export const PhotoImportWizard = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (list: FileList | null) => {
    if (!list) return;
    setError(null);
    const incoming = Array.from(list).slice(0, MAX_PHOTOS - files.length);
    for (const file of incoming) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Tipo no permitido. Usa JPEG, PNG o WebP.');
        continue;
      }
      try {
        const compressed = await compressImage(file, MENU_PHOTO_MAX_SIDE);
        setFiles((prev) => (prev.length < MAX_PHOTOS ? [...prev, compressed] : prev));
      } catch {
        setError(`No se pudo leer "${file.name}".`);
      }
    }
  };

  const handleStart = () => {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    void (async () => {
      try {
        const created = await createPhotoImport();
        if (!created.ok) {
          setError(created.error);
          setBusy(false);
          return;
        }
        const importId = created.data.importId;
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;
          setProgress(`Subiendo foto ${i + 1} de ${files.length}…`);
          const fd = new FormData();
          fd.append('file', file);
          const uploaded = await uploadImportPhoto(importId, i, fd);
          if (!uploaded.ok) {
            setError(uploaded.error);
            setBusy(false);
            setProgress(null);
            return;
          }
        }
        // Sin await: el procesamiento tarda varios segundos; la página del
        // import pollea el estado y muestra el resultado (o el error).
        void processMenuImport(importId);
        router.push(`/admin/menu/imports/${importId}` as Route);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setBusy(false);
        setProgress(null);
      }
    })();
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy || files.length >= MAX_PHOTOS}
        className="w-full rounded-lg border-2 border-dashed border-line-2 bg-surface-2 hover:border-brand transition-colors p-6 flex flex-col items-center gap-2 disabled:opacity-50"
      >
        <IconUpload size={24} className="text-ink-400" />
        <p className="text-sm text-ink-400">
          Sube fotos de tu menú impreso —{' '}
          <span className="text-brand font-medium">una por página</span>
        </p>
        <p className="text-xs text-ink-500">JPEG, PNG, WebP · hasta {MAX_PHOTOS} fotos</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 text-sm text-ink bg-surface border border-line rounded-md px-3 py-2"
            >
              <IconPhotoScan size={16} className="text-ink-400 shrink-0" />
              <span className="truncate flex-1">
                Página {i + 1} — {file.name}
              </span>
              <span className="text-xs text-ink-400">{Math.round(file.size / 1024)} KB</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                className="text-ink-300 hover:text-danger-text disabled:opacity-40"
                aria-label="Quitar foto"
              >
                <IconTrash size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-danger-text">{error}</p>}
      {progress && <p className="text-xs text-ink-400">{progress}</p>}

      <button
        type="button"
        onClick={handleStart}
        disabled={busy || files.length === 0}
        className="h-10 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover disabled:opacity-40 w-full"
      >
        {busy
          ? (progress ?? 'Procesando…')
          : `Extraer menú de ${files.length} foto${files.length === 1 ? '' : 's'}`}
      </button>

      <p className="text-xs text-ink-400">
        La extracción detecta productos, precios base y categorías. No detecta fotos de platillo,
        modificadores ni precios por canal — eso se ajusta en la revisión. Nada se publica sin tu
        confirmación.
      </p>
    </div>
  );
};
