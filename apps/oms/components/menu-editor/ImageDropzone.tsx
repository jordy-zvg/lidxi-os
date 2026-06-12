'use client';

import { compressImage } from '@/lib/compress-image';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRef, useState } from 'react';

interface ImageDropzoneProps {
  currentUrl: string | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
  uploading?: boolean;
  uploadProgress?: number;
}

const MAX_MB = 4;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageDropzone = ({
  currentUrl,
  onFileSelected,
  onRemove,
  uploading = false,
  uploadProgress = 0,
}: ImageDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Tipo no permitido. Usa JPEG, PNG o WebP.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen supera ${MAX_MB} MB.`);
      return;
    }
    const compressed = await compressImage(file);
    onFileSelected(compressed);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  };

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
    e.target.value = '';
  };

  if (currentUrl) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden border border-line">
        <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="bg-surface text-ink text-xs font-medium px-3 py-1.5 rounded hover:bg-surface-2"
          >
            Reemplazar
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="bg-surface text-danger-text text-xs font-medium px-3 py-1.5 rounded hover:bg-danger-soft"
          >
            Quitar
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          className="hidden"
          onChange={onInputChange}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`w-full aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
          dragOver ? 'border-brand bg-brand-soft' : 'border-line-2 bg-surface-2 hover:border-brand'
        }`}
      >
        {uploading ? (
          <div className="w-full px-8">
            <p className="text-xs text-ink-400 mb-2 text-center">Subiendo imagen…</p>
            <div className="h-1.5 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            {dragOver ? (
              <IconUpload size={28} className="text-brand" />
            ) : (
              <IconPhoto size={28} className="text-ink-400" />
            )}
            <p className="text-sm text-ink-400 text-center px-4">
              Arrastra una imagen o{' '}
              <span className="text-brand font-medium">haz click para subir</span>
            </p>
            <p className="text-xs text-ink-500">JPEG, PNG, WebP · máx {MAX_MB} MB</p>
          </>
        )}
      </button>
      {error && (
        <p className="mt-1 text-xs text-danger-text flex items-center gap-1">
          <IconX size={12} /> {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
};
