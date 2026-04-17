import { useEffect, useState } from "react";

/**
 * Kompres gambar sebelum upload menggunakan Canvas API.
 * - Resize ke max 1920px (sisi terpanjang)
 * - Konversi ke JPEG quality 0.82
 * - Skip jika file sudah < 300 KB (tidak perlu dikompres)
 */
export const compressImage = (
  file: File,
  maxSizePx = 1920,
  quality = 0.82,
): Promise<File> => {
  return new Promise((resolve) => {
    // Skip jika bukan gambar atau sudah kecil
    if (!file.type.startsWith("image/") || file.size < 300 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Hanya resize jika melebihi batas
      if (width > maxSizePx || height > maxSizePx) {
        const ratio = Math.min(maxSizePx / width, maxSizePx / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          // Ganti ekstensi ke .jpg untuk konsistensi
          const newName = file.name.replace(/\.[^.]+$/, ".jpg");
          resolve(new File([blob], newName, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fallback: pakai file asli
    };

    img.src = objectUrl;
  });
};

export const buildImageUrl = (filename: string): string => {
  if (!filename || filename.trim() === "") {
    return "";
  }

  // Jika sudah URL lengkap, return langsung
  if (
    filename.startsWith("http://") ||
    filename.startsWith("https://") ||
    filename.startsWith("data:")
  ) {
    return filename;
  }

  // Jika hanya filename, tambahkan base URL
  const baseUrl = import.meta.env.VITE_URL || window.location.origin;

  // Clean filename - remove any leading slashes
  const cleanFilename = filename.replace(/^\/+/, "");

  return `${baseUrl}/uploads/${cleanFilename}`;
};

export const isValidImage = (src: string): boolean => {
  if (!src || src.trim() === "") {
    return false;
  }

  // Cek ekstensi file
  const validExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".heic",
    ".heif",
  ];
  const lowerSrc = src.toLowerCase();

  return validExtensions.some((ext) => lowerSrc.endsWith(ext));
};

// Hook untuk handle image loading
export const useImageLoader = (src: string) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src || src.trim() === "") {
      setImageUrl("");
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const url = buildImageUrl(src);
    setImageUrl(url);

    // Pre-load image untuk cek error
    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
      setHasError(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageUrl, isLoading, hasError };
};
