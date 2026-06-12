'use client';

import type { MenuItemOptionGroup } from '@kobi/shared';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState, useTransition } from 'react';
import {
  type DraftScope,
  type MenuItemRow,
  createMenuItem,
  deleteMenuItem,
  updateMenuItem,
} from '../../lib/menu-actions';
import { deleteMenuImage, uploadMenuImage } from '../../lib/menu-storage';
import { ImageDropzone } from './ImageDropzone';
import { OptionsEditor } from './OptionsEditor';

interface ItemEditorPanelProps {
  item: MenuItemRow | null; // null = nuevo item
  categories: string[];
  /** En staging: los items nuevos nacen como borradores de este import. */
  draftDefaults?: DraftScope;
  onClose: () => void;
  onSaved: (item: MenuItemRow) => void;
  onDeleted: (id: string) => void;
}

export const ItemEditorPanel = ({
  item,
  categories,
  draftDefaults,
  onClose,
  onSaved,
  onDeleted,
}: ItemEditorPanelProps) => {
  const isNew = item === null;

  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState(item?.category ?? categories[0] ?? '');
  const [priceStr, setPriceStr] = useState(item ? String(item.base_price / 100) : '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [active, setActive] = useState(item?.active ?? true);
  const [options, setOptions] = useState<MenuItemOptionGroup[]>(item?.options ?? []);
  const [photoUrl, setPhotoUrl] = useState<string | null>(item?.photo_url ?? null);
  const [photoKey, setPhotoKey] = useState<string | null>(item?.photo_key ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setName(item?.name ?? '');
    setCategory(item?.category ?? categories[0] ?? '');
    setPriceStr(item ? String(item.base_price / 100) : '');
    setDescription(item?.description ?? '');
    setActive(item?.active ?? true);
    setOptions(item?.options ?? []);
    setPhotoUrl(item?.photo_url ?? null);
    setPhotoKey(item?.photo_key ?? null);
    setPendingFile(null);
    setError(null);
  }, [item, categories]);

  const handleFileSelected = (file: File) => {
    setPendingFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPendingFile(null);
    setPhotoUrl(null);
    setPhotoKey(null);
  };

  const handleSave = () => {
    setError(null);
    if (!name.trim()) return setError('El nombre es requerido.');
    if (!category.trim()) return setError('La categoría es requerida.');
    const price = Number.parseFloat(priceStr);
    if (Number.isNaN(price) || price < 0) return setError('Precio inválido.');

    startTransition(async () => {
      try {
        let finalPhotoUrl = photoKey ? photoUrl : null;
        let finalPhotoKey = photoKey;

        // Upload imagen si hay archivo pendiente.
        // tenant_id se resuelve dentro de uploadMenuImage via requireTenant().
        if (pendingFile) {
          setUploadProgress(0);
          const tempId = item?.id ?? `new-${Date.now()}`;
          const fd = new FormData();
          fd.append('file', pendingFile);
          const uploaded = await uploadMenuImage(fd, tempId);
          finalPhotoUrl = uploaded.url;
          finalPhotoKey = uploaded.key;
          setUploadProgress(100);
        }

        // Filtra grupos/choices vacíos antes de persistir.
        const cleanOptions = options
          .map((g) => ({ ...g, choices: g.choices.filter((c) => c.name.trim()) }))
          .filter((g) => g.group.trim() && g.choices.length > 0);

        const payload = {
          name: name.trim(),
          category: category.trim(),
          base_price: Math.round(price * 100),
          description: description.trim() || undefined,
          photo_url: finalPhotoUrl ?? undefined,
          photo_key: finalPhotoKey ?? undefined,
          active,
          options: cleanOptions,
        };

        const result = isNew
          ? await createMenuItem(payload, draftDefaults)
          : await updateMenuItem(item.id, payload);

        if (!result.ok) return setError(result.error);
        onSaved(result.data);
      } catch (e) {
        setError(String(e));
      }
    });
  };

  const handleDelete = () => {
    if (!item) return;
    if (!confirm(`¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      if (item.photo_key) await deleteMenuImage(item.photo_key);
      const result = await deleteMenuItem(item.id);
      if (!result.ok) return setError(result.error);
      onDeleted(item.id);
    });
  };

  return (
    <aside className="w-[380px] shrink-0 flex flex-col border-l border-line bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
        <h3 className="text-base font-semibold text-ink">{isNew ? 'Nuevo item' : 'Editar item'}</h3>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Cuerpo scrolleable */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Marcado por el importador: revisión obligatoria. Guardar limpia la marca. */}
        {item?.review_reasons && item.review_reasons.length > 0 && (
          <div className="rounded-lg border border-[#F59E0B] bg-[#FFFBEB] p-3">
            <p className="text-xs font-semibold text-[#B45309] mb-1">Por revisar</p>
            <ul className="text-xs text-[#92400E] list-disc pl-4 space-y-0.5">
              {item.review_reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <p className="text-[11px] text-[#92400E] mt-1.5">
              Corrige los datos y guarda — la marca se quita al guardar.
            </p>
          </div>
        )}

        {/* Foto */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
            Foto
          </span>
          <ImageDropzone
            currentUrl={photoUrl}
            onFileSelected={handleFileSelected}
            onRemove={handleRemovePhoto}
            uploading={isPending && !!pendingFile}
            uploadProgress={uploadProgress}
          />
        </div>

        {/* Nombre */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1"
            htmlFor="item-name"
          >
            Nombre *
          </label>
          <input
            id="item-name"
            type="text"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
          />
        </div>

        {/* Categoría (typeahead: sugerencias existentes + categoría libre) */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1"
            htmlFor="item-cat"
          >
            Categoría *
          </label>
          <input
            id="item-cat"
            type="text"
            list="item-cat-options"
            value={category}
            maxLength={40}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej. Entradas, Bebidas, Postres"
            className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
          />
          <datalist id="item-cat-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        {/* Precio */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1"
            htmlFor="item-price"
          >
            Precio *
          </label>
          <div className="flex items-center border border-line-2 rounded-md bg-canvas overflow-hidden focus-within:border-brand">
            <span className="px-3 font-mono text-sm text-ink-400 border-r border-line-2 h-9 flex items-center">
              $
            </span>
            <input
              id="item-price"
              type="number"
              value={priceStr}
              min="0"
              step="0.50"
              onChange={(e) => setPriceStr(e.target.value)}
              className="flex-1 h-9 px-3 font-mono text-sm text-ink bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1"
            htmlFor="item-desc"
          >
            Descripción
          </label>
          <textarea
            id="item-desc"
            value={description}
            maxLength={240}
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-line-2 bg-canvas px-3 py-2 text-sm text-ink resize-none focus:outline-none focus:border-brand"
          />
          <p className="text-xs text-ink-400 mt-0.5">{description.length}/240</p>
        </div>

        {/* Modificadores */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
            Modificadores
          </span>
          <OptionsEditor value={options} onChange={setOptions} />
        </div>

        {/* Disponibilidad */}
        <div className="rounded-lg border border-line p-3 bg-canvas space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink">Disponible en menú público</span>
            <button
              type="button"
              onClick={() => setActive((v) => !v)}
              className={`relative h-5 w-9 rounded-full transition-colors ${active ? 'bg-brand' : 'bg-ink-500'}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${active ? 'left-[18px]' : 'left-0.5'}`}
              />
            </button>
          </div>
          <p className="text-xs text-ink-400">
            Cuando se pausa, el item desaparece de la tienda directa y de los marketplaces
            conectados.
          </p>
        </div>

        {error && <p className="text-xs text-danger-text">{error}</p>}
      </div>

      {/* Footer sticky */}
      <div className="shrink-0 border-t border-line px-5 py-4 flex items-center gap-2">
        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm font-medium text-danger-text hover:underline disabled:opacity-40"
          >
            Eliminar
          </button>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="h-9 px-4 rounded-md border border-line-2 text-sm text-ink-200 hover:bg-surface-2 disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover disabled:opacity-40"
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </aside>
  );
};
