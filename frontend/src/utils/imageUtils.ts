import { useEffect, useState } from "react";

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
