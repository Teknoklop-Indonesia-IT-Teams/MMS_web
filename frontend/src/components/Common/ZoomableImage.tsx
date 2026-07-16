import React, { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn } from "lucide-react";

export const getImageFullUrl = (path: string): string => {
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const baseUrl =
    import.meta.env.VITE_URL ||
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:3001";
  return `${baseUrl}${path}`;
};

const Lightbox = memo(function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      <button
        className="absolute p-2 text-white transition-colors bg-gray-700 rounded-full top-4 right-4 hover:bg-gray-600"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt || "Image"} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        {alt && <p className="mt-2 text-sm text-center text-white opacity-75">{alt}</p>}
      </div>
    </div>,
    document.body,
  );
});

interface ZoomableImageProps {
  src: string;
  alt?: string;
  size?: number;
}

const ZoomableImage: React.FC<ZoomableImageProps> = memo(function ZoomableImage({
  src,
  alt,
  size = 64,
}) {
  const [showLightbox, setShowLightbox] = useState(false);
  const fullSrc = getImageFullUrl(src);

  return (
    <>
      <div
        className="relative overflow-hidden bg-gray-100 border border-gray-200 rounded-md shadow-sm cursor-pointer dark:bg-gray-700 dark:border-gray-600 group"
        style={{ width: size, height: size }}
        onClick={() => setShowLightbox(true)}
        title="Klik untuk memperbesar"
      >
        <img
          src={fullSrc}
          alt={alt || "Record Image"}
          className="object-cover w-full h-full transition-opacity group-hover:opacity-80"
          loading="lazy"
          width={size}
          height={size}
        />
        <div className="absolute inset-0 flex items-center justify-center transition-all bg-black bg-opacity-0 group-hover:bg-opacity-30">
          <ZoomIn size={16} className="text-white transition-opacity opacity-0 group-hover:opacity-100" />
        </div>
      </div>
      {showLightbox && <Lightbox src={fullSrc} alt={alt} onClose={() => setShowLightbox(false)} />}
    </>
  );
});

export default ZoomableImage;
