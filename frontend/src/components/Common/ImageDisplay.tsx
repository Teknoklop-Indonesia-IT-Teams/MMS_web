import React, { useState, useEffect, memo } from "react";

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  src,
  alt,
  className = "",
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoading(true);

    // Check if src is empty or invalid
    if (!src || src.trim() === "") {
      setHasError(true);
      setIsLoading(false);
      return;
    }
  }, [src, alt]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  // Show error state for empty/invalid src
  if (!src || src.trim() === "" || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-gray-200 ${className}`}
      >
        <div className="flex flex-col items-center text-gray-400">
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs">No Image</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        decoding="async"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-1"></div>
            <span className="text-xs">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ImageDisplay);
