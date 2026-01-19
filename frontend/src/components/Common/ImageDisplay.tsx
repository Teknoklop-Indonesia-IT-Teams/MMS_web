import React, { useState, useEffect, memo } from "react";

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  src,
  alt,
  className = "",
  onError,
  onLoad,
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>("");

  useEffect(() => {
    console.log(`🖼️ ImageDisplay received src:`, src);

    // Reset states
    setHasError(false);
    setIsLoading(false);
    setCurrentSrc("");

    if (!src || src.trim() === "" || src === "undefined" || src === "null") {
      console.log(`⚠️ Empty image source for ${alt}`);
      setHasError(true);
      setImageUrl("");
      return;
    }

    // Process the URL
    let processedUrl = src;

    // If it's just a filename (no http, no data:, no /), prepend the base URL
    const isRelativePath =
      !processedUrl.startsWith("http") &&
      !processedUrl.startsWith("data:") &&
      !processedUrl.startsWith("/");

    if (isRelativePath) {
      // Remove any leading slashes or unwanted characters
      const cleanFilename = processedUrl.replace(/^\/+/, "");
      const baseUrl = import.meta.env.VITE_URL || window.location.origin;
      processedUrl = `${baseUrl}/uploads/${cleanFilename}`;
    }

    // Add cache busting in development mode
    if (import.meta.env.DEV) {
      const urlObj = new URL(processedUrl, window.location.origin);
      if (!urlObj.searchParams.has("t")) {
        urlObj.searchParams.set("t", Date.now().toString());
        processedUrl = urlObj.toString();
      }
    }

    console.log(`🖼️ Processed URL: ${processedUrl}`);
    setImageUrl(processedUrl);
    setCurrentSrc(src); // Store original src for comparison
    setIsLoading(true); // Start loading
  }, [src, alt]);

  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully: ${alt}`);
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    console.error(`❌ Failed to load image: ${imageUrl}`);
    setIsLoading(false);
    setHasError(true);
    if (onError) onError();
  };

  // ========== RENDER LOGIC ==========

  // Jika tidak ada sumber gambar
  if (!src || src.trim() === "" || src === "undefined" || src === "null") {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <div className="flex flex-col items-center text-gray-400">
          <svg
            className="w-8 h-8 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs">No Image</span>
        </div>
      </div>
    );
  }

  // Jika error loading gambar
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <div className="flex flex-col items-center text-gray-400">
          <svg
            className="w-8 h-8 mb-2 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-xs">Failed to load</span>
        </div>
      </div>
    );
  }

  // Render gambar
  return (
    <div className={`relative ${className}`}>
      {/* Gambar utama */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-xs text-gray-500">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Versi lebih sederhana untuk debugging
export const SimpleImageDisplay: React.FC<ImageDisplayProps> = ({
  src,
  alt,
  className = "",
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (!src || src.trim() === "") {
      setImageUrl("");
      return;
    }

    let processedUrl = src;

    // Jika hanya filename, tambahkan base URL
    if (
      !processedUrl.startsWith("http") &&
      !processedUrl.startsWith("data:") &&
      !processedUrl.startsWith("/")
    ) {
      const baseUrl = import.meta.env.VITE_URL || window.location.origin;
      processedUrl = `${baseUrl}/uploads/${processedUrl}`;
    }

    setImageUrl(processedUrl);
  }, [src]);

  if (!src || src.trim() === "") {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
      >
        <span className="text-xs text-gray-500">No Img</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onError={(e) => {
        console.error(`Failed to load: ${imageUrl}`);
        e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
          <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#f3f4f6"/>
            <text x="50" y="50" font-family="Arial" font-size="10" text-anchor="middle" fill="#9ca3af">${alt}</text>
          </svg>
        `)}`;
      }}
    />
  );
};

export default memo(ImageDisplay);
