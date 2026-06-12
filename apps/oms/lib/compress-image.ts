/**
 * Compresión de imagen vía canvas. SOLO cliente (usa DOM) — importar desde
 * componentes 'use client'. La compresión previa al upload es lo que mantiene
 * los archivos debajo del bodySizeLimit de las server actions.
 */
export async function compressImage(file: File, maxSide = 1200, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      const scale = width > height ? maxSide / width : maxSide / height;
      const w = scale < 1 ? Math.round(width * scale) : width;
      const h = scale < 1 ? Math.round(height * scale) : height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas no disponible'));
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Error al comprimir'));
          resolve(new File([blob], file.name, { type: file.type }));
        },
        file.type,
        quality,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}
